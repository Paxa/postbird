// Adds an LC_LOAD_DYLIB for Cocoa.framework to a thin arm64 Mach-O executable
// so AppKit checks in with LaunchServices at load time inside the App Sandbox.

import { readFileSync, writeFileSync } from "fs";

const MH_MAGIC_64 = 0xfeedfacf;
const CPU_TYPE_ARM64 = 0x0100000c;
const LC_SEGMENT_64 = 0x19;
const LC_LOAD_DYLIB = 0xc;
const COCOA = "/System/Library/Frameworks/Cocoa.framework/Versions/A/Cocoa";
const HEADER_SIZE = 32;

export function addCocoaLoadCommand(buf: Buffer): { added: boolean; cmdsize: number; remainingPadding: number } {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  if (view.getUint32(0, true) !== MH_MAGIC_64) {
    throw new Error("not a thin 64-bit little-endian Mach-O (fat binaries unsupported)");
  }
  if (view.getUint32(4, true) !== CPU_TYPE_ARM64) {
    throw new Error("not arm64");
  }

  const ncmds = view.getUint32(16, true);
  const sizeofcmds = view.getUint32(20, true);

  let off = HEADER_SIZE;
  let firstSection = Infinity;
  for (let i = 0; i < ncmds; i++) {
    const cmd = view.getUint32(off, true);
    const cmdsize = view.getUint32(off + 4, true);
    if (cmd === LC_LOAD_DYLIB || cmd === 0xd || cmd === 0x80000018) {
      const nameOff = view.getUint32(off + 8, true);
      const name = buf.subarray(off + nameOff, off + cmdsize).toString("latin1").split("\0")[0];
      if (name.includes("Cocoa.framework")) {
        return { added: false, cmdsize: 0, remainingPadding: 0 };
      }
    }
    if (cmd === LC_SEGMENT_64) {
      const nsects = view.getUint32(off + 64, true);
      for (let s = 0; s < nsects; s++) {
        const sect = off + 72 + s * 80;
        const sectOffset = view.getUint32(sect + 48, true);
        const type = view.getUint32(sect + 64, true) & 0xff;
        const zerofill = type === 0x1 || type === 0xc || type === 0x12;
        if (!zerofill && sectOffset > 0 && sectOffset < firstSection) firstSection = sectOffset;
      }
    }
    off += cmdsize;
  }
  if (off !== HEADER_SIZE + sizeofcmds) throw new Error("load command sizes do not match sizeofcmds");
  if (!isFinite(firstSection)) throw new Error("could not find first section offset");

  const nameBytes = Buffer.from(COCOA + "\0", "latin1");
  const cmdsize = Math.ceil((24 + nameBytes.length) / 8) * 8;
  const free = firstSection - (HEADER_SIZE + sizeofcmds);
  if (free < cmdsize) throw new Error(`need ${cmdsize} bytes of header padding, only ${free} available`);

  const at = HEADER_SIZE + sizeofcmds;
  buf.fill(0, at, at + cmdsize);
  view.setUint32(at, LC_LOAD_DYLIB, true);
  view.setUint32(at + 4, cmdsize, true);
  view.setUint32(at + 8, 24, true);
  view.setUint32(at + 12, 2, true);
  view.setUint32(at + 16, 0x00010000, true);
  view.setUint32(at + 20, 0x00010000, true);
  nameBytes.copy(buf, at + 24);

  view.setUint32(16, ncmds + 1, true);
  view.setUint32(20, sizeofcmds + cmdsize, true);

  return { added: true, cmdsize, remainingPadding: free - cmdsize };
}

if (import.meta.main) {
  const path = process.argv[2];
  if (!path) {
    console.error("add_cocoa_load_command: usage: add_cocoa_load_command.ts <mach-o>");
    process.exit(1);
  }
  try {
    const buf = readFileSync(path);
    const res = addCocoaLoadCommand(buf);
    if (!res.added) {
      console.log("Cocoa load command already present; nothing to do.");
      process.exit(0);
    }
    writeFileSync(path, buf);
    console.log(`Added Cocoa load command to ${path} (${res.cmdsize} bytes, ${res.remainingPadding} bytes of padding left).`);
  } catch (err: any) {
    console.error(`add_cocoa_load_command: ${err?.message || err}`);
    process.exit(1);
  }
}
