// Re-points bun's ICU imports from /usr/lib/libicucore.A.dylib to a bundled
// @rpath/libpbicu.dylib by renaming _u<name> -> _p<name> in-place in both
// LC_SYMTAB and LC_DYLD_CHAINED_FIXUPS string tables.

import { readFileSync, writeFileSync } from "fs";

const MH_MAGIC_64 = 0xfeedfacf;
const CPU_TYPE_ARM64 = 0x0100000c;
const LC_SYMTAB = 0x2;
const LC_LOAD_DYLIB = 0xc;
const LC_LOAD_WEAK_DYLIB = 0x80000018;
const LC_REEXPORT_DYLIB = 0x8000001f;
const LC_LOAD_UPWARD_DYLIB = 0x80000023;
const LC_DYLD_CHAINED_FIXUPS = 0x80000034;
const HEADER_SIZE = 32;

export const OLD_DYLIB = "/usr/lib/libicucore.A.dylib";
export const NEW_DYLIB = "@rpath/libpbicu.dylib";
export const RPATH = "@executable_path";

function cstring(buf: Buffer, off: number): string {
  let end = off;
  while (end < buf.length && buf[end] !== 0) end++;
  return buf.subarray(off, end).toString("latin1");
}

export function patchBunIcuBuffer(original: Buffer): {
  buf: Buffer;
  symbolCount: number;
  occurrences: number;
} {
  const buf = Buffer.from(original);
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  if (view.getUint32(0, true) !== MH_MAGIC_64) throw new Error("not a thin 64-bit little-endian Mach-O");
  if (view.getUint32(4, true) !== CPU_TYPE_ARM64) throw new Error("not arm64");

  const ncmds = view.getUint32(16, true);
  let off = HEADER_SIZE;
  let ordinal = 0;
  let icuOrdinal = 0;
  let symtab: { symoff: number; nsyms: number; stroff: number; strsize: number } | null = null;
  let fixups: { dataoff: number; datasize: number } | null = null;

  for (let i = 0; i < ncmds; i++) {
    const cmd = view.getUint32(off, true);
    const cmdsize = view.getUint32(off + 4, true);
    if (cmd === LC_LOAD_DYLIB || cmd === LC_LOAD_WEAK_DYLIB || cmd === LC_REEXPORT_DYLIB || cmd === LC_LOAD_UPWARD_DYLIB) {
      ordinal++;
      const name = cstring(buf, off + view.getUint32(off + 8, true));
      if (name === OLD_DYLIB) icuOrdinal = ordinal;
    } else if (cmd === LC_SYMTAB) {
      symtab = {
        symoff: view.getUint32(off + 8, true),
        nsyms: view.getUint32(off + 12, true),
        stroff: view.getUint32(off + 16, true),
        strsize: view.getUint32(off + 20, true),
      };
    } else if (cmd === LC_DYLD_CHAINED_FIXUPS) {
      fixups = { dataoff: view.getUint32(off + 8, true), datasize: view.getUint32(off + 12, true) };
    }
    off += cmdsize;
  }

  if (!icuOrdinal) throw new Error(`no ${OLD_DYLIB} load command (already patched?)`);
  if (!symtab) throw new Error("no LC_SYMTAB");
  if (!fixups) throw new Error("no LC_DYLD_CHAINED_FIXUPS (only chained-fixups binaries are supported)");

  const patchOffsets = new Map<number, string>();
  const names = { symtab: new Set<string>(), fixups: new Set<string>() };

  function claim(nameOff: number, from: "symtab" | "fixups"): void {
    const name = cstring(buf, nameOff);
    if (!/^_u[A-Za-z0-9_]*$/.test(name)) throw new Error(`unexpected ICU import name "${name}" (${from})`);
    patchOffsets.set(nameOff + 1, name);
    names[from].add(name);
  }

  for (let i = 0; i < symtab.nsyms; i++) {
    const e = symtab.symoff + i * 16;
    const nStrx = view.getUint32(e, true);
    const nType = buf[e + 4];
    const nDesc = view.getUint16(e + 6, true);
    const undefinedExternal = (nType & 0x0e) === 0 && (nType & 0x01) === 1;
    if (undefinedExternal && ((nDesc >> 8) & 0xff) === icuOrdinal) claim(symtab.stroff + nStrx, "symtab");
  }

  {
    const base = fixups.dataoff;
    const importsOffset = view.getUint32(base + 8, true);
    const symbolsOffset = view.getUint32(base + 12, true);
    const importsCount = view.getUint32(base + 16, true);
    const importsFormat = view.getUint32(base + 20, true);
    const stride = importsFormat === 1 ? 4 : importsFormat === 2 ? 8 : importsFormat === 3 ? 16 : 0;
    if (!stride) throw new Error(`unknown chained imports format ${importsFormat}`);
    for (let i = 0; i < importsCount; i++) {
      const e = base + importsOffset + i * stride;
      let lib: number;
      let nameOffset: number;
      if (importsFormat === 3) {
        const v = view.getBigUint64(e, true);
        lib = Number(v & 0xffffn);
        nameOffset = Number(v >> 32n);
      } else {
        const v = view.getUint32(e, true);
        lib = v & 0xff;
        nameOffset = v >>> 9;
      }
      if (lib === icuOrdinal) claim(base + symbolsOffset + nameOffset, "fixups");
    }
  }

  if (names.symtab.size === 0) throw new Error("no imports from libicucore found");
  const a = [...names.symtab].sort().join("\n");
  const b = [...names.fixups].sort().join("\n");
  if (a !== b) throw new Error("symtab and chained-fixups disagree on the set of ICU imports");

  for (const o of patchOffsets.keys()) {
    if (buf[o] !== 0x75) throw new Error(`expected "u" at offset ${o}`);
    buf[o] = 0x70;
  }

  let changed = 0;
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === original[i]) continue;
    if (!patchOffsets.has(i)) throw new Error(`unexpected change at offset ${i}`);
    changed++;
  }
  if (changed !== patchOffsets.size) throw new Error(`replaced ${changed} of ${patchOffsets.size} expected bytes`);

  for (const name of names.symtab) {
    const needle = Buffer.from(`\0${name}\0`, "latin1");
    if (buf.includes(needle)) throw new Error(`${name} is still present after patching`);
  }

  return { buf, symbolCount: names.symtab.size, occurrences: patchOffsets.size };
}

function run(cmd: string[]): void {
  const res = Bun.spawnSync(cmd, { stdout: "inherit", stderr: "inherit" });
  if (res.exitCode !== 0) throw new Error(`${cmd.join(" ")} exited with ${res.exitCode}`);
}

if (import.meta.main) {
  const path = process.argv[2];
  if (!path) {
    console.error("patch_bun_icu: usage: patch_bun_icu.ts <bun-mach-o>");
    process.exit(1);
  }
  try {
    run(["codesign", "--remove-signature", path]);
    const original = readFileSync(path);
    const { buf, symbolCount, occurrences } = patchBunIcuBuffer(original);
    writeFileSync(path, buf);
    console.log(`Renamed ${symbolCount} ICU imports (${occurrences} string occurrences).`);
    run(["install_name_tool", "-change", OLD_DYLIB, NEW_DYLIB, path]);
    run(["install_name_tool", "-add_rpath", RPATH, path]);
    console.log(`Linked ${NEW_DYLIB} (rpath ${RPATH}).`);
  } catch (err: any) {
    console.error(`patch_bun_icu: ${err?.message || err}`);
    process.exit(1);
  }
}
