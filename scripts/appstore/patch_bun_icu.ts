// Re-points bun's ICU imports from the system libicucore to a bundled libpbicu.
//
// App Review rejects binaries that import ICU's C API from /usr/lib/libicucore
// (unversioned names such as _ubrk_clone count as non-public API). Every macOS
// bun build has those imports because JavaScriptCore links the system ICU. The
// bundle ships libpbicu.dylib, a private ICU 78.1 whose exports are aliased
// from _<name>_78 to _p<name minus its leading "u"> (_ubrk_clone -> _pbrk_clone).
// This script renames the imports in bun to match, in place and at the same
// length, then rewrites the dylib reference.
//
// Usage: bun scripts/appstore/patch_bun_icu.ts <bun-mach-o>
//
// Steps:
//   1. codesign --remove-signature
//   2. in __LINKEDIT, change the leading "_u" to "_p" for every import from
//      libicucore, both in the chained-fixups symbol pool and in the symtab
//      string table. Anything else that changes is an error.
//   3. install_name_tool -change /usr/lib/libicucore.A.dylib @rpath/libpbicu.dylib
//      and -add_rpath @executable_path
//
// The caller re-signs afterwards (ad-hoc for the smoke test, Apple Distribution
// for the real bundle).

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

const OLD_DYLIB = "/usr/lib/libicucore.A.dylib";
const NEW_DYLIB = "@rpath/libpbicu.dylib";
const RPATH = "@executable_path";

function fail(msg: string): never {
  console.error(`patch_bun_icu: ${msg}`);
  process.exit(1);
}

function run(cmd: string[]): void {
  const res = Bun.spawnSync(cmd, { stdout: "inherit", stderr: "inherit" });
  if (res.exitCode !== 0) fail(`${cmd.join(" ")} exited with ${res.exitCode}`);
}

function cstring(buf: Buffer, off: number): string {
  let end = off;
  while (end < buf.length && buf[end] !== 0) end++;
  return buf.subarray(off, end).toString("latin1");
}

const path = process.argv[2];
if (!path) fail("usage: patch_bun_icu.ts <bun-mach-o>");

run(["codesign", "--remove-signature", path]);

const original = readFileSync(path);
const buf = Buffer.from(original); // patched copy
const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

if (view.getUint32(0, true) !== MH_MAGIC_64) fail("not a thin 64-bit little-endian Mach-O");
if (view.getUint32(4, true) !== CPU_TYPE_ARM64) fail("not arm64");

// ── Load commands ────────────────────────────────────────────────────────────
const ncmds = view.getUint32(16, true);
let off = HEADER_SIZE;
let ordinal = 0; // 1-based position among dylib load commands
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

if (!icuOrdinal) fail(`no ${OLD_DYLIB} load command (already patched?)`);
if (!symtab) fail("no LC_SYMTAB");
if (!fixups) fail("no LC_DYLD_CHAINED_FIXUPS (only chained-fixups binaries are supported)");

// ── Collect the string offsets to rewrite ────────────────────────────────────
const patchOffsets = new Map<number, string>(); // file offset of the "u" -> symbol name
const names = { symtab: new Set<string>(), fixups: new Set<string>() };

function claim(nameOff: number, from: "symtab" | "fixups"): void {
  const name = cstring(buf, nameOff);
  if (!/^_u[A-Za-z0-9_]*$/.test(name)) fail(`unexpected ICU import name "${name}" (${from})`);
  patchOffsets.set(nameOff + 1, name);
  names[from].add(name);
}

// symtab: undefined external nlist_64 entries bound to libicucore.
for (let i = 0; i < symtab.nsyms; i++) {
  const e = symtab.symoff + i * 16;
  const nStrx = view.getUint32(e, true);
  const nType = buf[e + 4];
  const nDesc = view.getUint16(e + 6, true);
  const undefinedExternal = (nType & 0x0e) === 0 && (nType & 0x01) === 1;
  if (undefinedExternal && ((nDesc >> 8) & 0xff) === icuOrdinal) claim(symtab.stroff + nStrx, "symtab");
}

// chained fixups: the imports table points into a symbol pool.
{
  const base = fixups.dataoff;
  const importsOffset = view.getUint32(base + 8, true);
  const symbolsOffset = view.getUint32(base + 12, true);
  const importsCount = view.getUint32(base + 16, true);
  const importsFormat = view.getUint32(base + 20, true);
  const stride = importsFormat === 1 ? 4 : importsFormat === 2 ? 8 : importsFormat === 3 ? 16 : 0;
  if (!stride) fail(`unknown chained imports format ${importsFormat}`);
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

if (names.symtab.size === 0) fail("no imports from libicucore found");
const a = [...names.symtab].sort().join("\n");
const b = [...names.fixups].sort().join("\n");
if (a !== b) fail("symtab and chained-fixups disagree on the set of ICU imports");

// ── Rewrite ──────────────────────────────────────────────────────────────────
for (const o of patchOffsets.keys()) {
  if (buf[o] !== 0x75 /* u */) fail(`expected "u" at offset ${o}`);
  buf[o] = 0x70; // p
}

// Assert that exactly those bytes changed.
let changed = 0;
for (let i = 0; i < buf.length; i++) {
  if (buf[i] === original[i]) continue;
  if (!patchOffsets.has(i)) fail(`unexpected change at offset ${i}`);
  changed++;
}
if (changed !== patchOffsets.size) fail(`replaced ${changed} of ${patchOffsets.size} expected bytes`);

// Nothing may still name an ICU import under the old spelling.
for (const name of names.symtab) {
  const needle = Buffer.from(`\0${name}\0`, "latin1");
  if (buf.includes(needle)) fail(`${name} is still present after patching`);
}

writeFileSync(path, buf);
console.log(`Renamed ${names.symtab.size} ICU imports (${patchOffsets.size} string occurrences).`);

// ── Re-point the dylib ───────────────────────────────────────────────────────
run(["install_name_tool", "-change", OLD_DYLIB, NEW_DYLIB, path]);
run(["install_name_tool", "-add_rpath", RPATH, path]);
console.log(`Linked ${NEW_DYLIB} (rpath ${RPATH}).`);
