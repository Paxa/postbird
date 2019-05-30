/// <reference types="node" />

import child_process = require("child_process");

declare global {
  export interface ChildProcessExt extends child_process.ChildProcess {}
}
