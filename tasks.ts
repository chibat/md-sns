#!/usr/bin/env -S deno run -A --unstable --no-check

import { deno, denoDir, tasks, rm, $ } from "./tasks_utils.ts";

//const CLI="https://deno.land/x/aleph@v0.3.0-beta.19/cli.ts";
const COMMAND_PATH="https://deno.land/x/aleph@v0.3.0-beta.19/commands";

const databaseUrl = Deno.env.get("DATABASE_URL");
if (!databaseUrl) {
  console.error("env.DATABASE_URL");
  Deno.exit(1);
}

const databaseHost = new URL(databaseUrl).host;
const databaseHostname = new URL(databaseUrl).hostname;

const home = Deno.env.get("HOME");
if (!home) {
  console.error("env.HOME");
  Deno.exit(1);
}

const esbuild = `${home}/.cache/esbuild/bin/esbuild-linux-64@0.13.2`;

await tasks(test, dev, start, deploy, clean, logs);

async function dev() {
  const PORT = 8080;
  await deno({
    command: "run",
    "--allow-read": [
      Deno.cwd(),
      Deno.execPath(),
      await denoDir()
    ],
    "--allow-write": [
      "./.aleph",
      `${home}/.cache`
    ],
    "--allow-net": [
      `:${PORT}`,
      "deno.land",
      "accounts.google.com",
      "www.googleapis.com",
      "esm.sh",
      "cdn.esm.sh",
      "registry.npmjs.org",
      "cdnjs.cloudflare.com",
      databaseHost,
      `${databaseHostname}:0`,
    ],
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
      "APP_AUTH_CLIENT_ID",
      "APP_AUTH_CLIENT_SECRET",
      "DATABASE_URL",
    ],
    "--allow-run": [
      Deno.execPath(),
      esbuild,
    ],
    args: [
      "--import-map=import_map.json",
      `--location=http://localhost:${PORT}`,
      "--unstable",
      `--unsafely-ignore-certificate-errors=${databaseHostname}`,
      `${COMMAND_PATH}/dev.ts`,
    ],
  });
}

async function start() {
  const PORT = 8080;

  await deno({
    command: "run",
    "--allow-read": [
      Deno.cwd(),
      Deno.execPath(),
      await denoDir()
    ],
    "--allow-write": [
      "./.aleph",
      `${home}/.cache`
    ],
    "--allow-net": [
      `:${PORT}`,
      "deno.land",
      "accounts.google.com",
      "www.googleapis.com",
      "esm.sh",
      "cdn.esm.sh",
      "registry.npmjs.org",
      "cdnjs.cloudflare.com",
      databaseHost,
      `${databaseHostname}:0`,
    ],
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
      "APP_AUTH_CLIENT_ID",
      "APP_AUTH_CLIENT_SECRET",
      "DATABASE_URL",
    ],
    "--allow-run": [
      Deno.execPath(),
      esbuild,
    ],
    args: [
      "--import-map=import_map.json",
      `--location=http://localhost:${PORT}`,
      "--unstable",
      "--no-check",
      `--unsafely-ignore-certificate-errors=${databaseHostname}`,
      `${COMMAND_PATH}/start.ts`,
    ],
  });
}

async function test() {
  // write test script
}


async function deploy() {
  await $(["git", "push", "heroku", "main"]);
}

async function clean() {
  rm(".aleph");
  rm("dist");
}

async function logs() {
  await $(["heroku", "logs", "-a", "md-sns", "--tail"]);
}

