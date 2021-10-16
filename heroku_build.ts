#!/usr/bin/env -S deno run -A --unstable

import { deno, denoDir } from "./tasks_utils.ts";

const COMMAND_PATH="https://deno.land/x/aleph@v0.3.0-beta.19/commands";

const home = Deno.env.get("HOME");
if (!home) {
  console.error("env.HOME");
  Deno.exit(1);
}

const esbuild = `${home}/.cache/esbuild/bin/esbuild-linux-64@0.13.2`;

/*
await deno({
  command: "run",
  "--allow-net": [
    "deno.land",
    "esm.sh",
    "cdn.esm.sh",
    "registry.npmjs.org",
    "cdnjs.cloudflare.com",
    "cdn.jsdelivr.net",
  ],
  "--allow-read": true,
  "--allow-env": [
    "ALEPH_DEV",
    "DENO_TESTING",
    "ALEPH_DEV_PORT",
    "ALEPH_ENV",
    "ALEPH_FRAMEWORK",
    "ALEPH_WORKING_DIR",
    "ALEPH_VERSION",
    "ESBUILD_BINARY_PATH",
    "XDG_CACHE_HOME",
    "HOME",
  ],
  "--allow-write": [
    "./.aleph",
    "./dist",
    await denoDir(),
    `${home}/.cache`,
  ],
  "--allow-run": [
    Deno.execPath(),
    esbuild,
  ],
  args: [
    "--import-map=import_map.json",
    "--unstable",
    `${COMMAND_PATH}/build.ts`,
  ],
});
*/

await deno({
  command: "cache",
  args: [
    "--import-map=import_map.json",
    "--unstable",
    "lib/db.ts",
  ],
});


