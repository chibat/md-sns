import { existsSync } from "https://deno.land/std@0.107.0/fs/exists.ts";

export async function tasks(...taskArgs: (() => Promise<void>)[]) {
  if (Deno.args.length === 0) {
    taskArgs.forEach((task) => console.log(task.name));
    Deno.exit(0);
  }
  for (const taskName of Deno.args) {
    const task = taskArgs.find((task) => task.name === taskName);
    if (task) {
      console.log(taskName);
      await task();
    } else {
      console.log("Unknown task name");
      Deno.exit(1);
    }
  }
}

export async function $(cmd: string[]): Promise<void> {
  const status = await Deno.run({
    cmd,
    stdout: "inherit",
    stderr: "inherit",
  }).status();
  if (status.code != 0) {
    Deno.exit(status.code);
  }
}

export function rm(path: string) {
  if (existsSync(path)) {
    Deno.removeSync(path, { recursive: true });
  }
}

export async function denoDir() {
  const p = Deno.run({
    cmd: [Deno.execPath(), "info", "--json", "--unstable"],
    stdout: "piped",
    stderr: "null",
  });
  const output = (new TextDecoder()).decode(await p.output());
  p.close();
  return JSON.parse(output).denoDir;
}

type DenoOptions = {
  command: "run" | "cache";
  "--allow-read"?: string[] | boolean;
  "--allow-write"?: string[] | boolean;
  "--allow-net"?: string[] | boolean;
  "--allow-env"?: string[] | boolean;
  "--allow-run"?: string[] | boolean;
  args: string[];
};

function arrayOption(cmd: string[], name: string, option?: string[] | boolean) {
  if (option) {
    if (option instanceof Array && option.length > 0) {
      cmd.push(name + "=" + option.join(","));
    } else if (option === true) {
      cmd.push(name);
    }
  }
}

export async function deno(options: DenoOptions): Promise<void> {
  const cmd = [Deno.execPath()];
  cmd.push(options.command);
  arrayOption(cmd, "--allow-read", options["--allow-read"]);
  arrayOption(cmd, "--allow-write", options["--allow-write"]);
  arrayOption(cmd, "--allow-net", options["--allow-net"]);
  arrayOption(cmd, "--allow-env", options["--allow-env"]);
  arrayOption(cmd, "--allow-run", options["--allow-run"]);
  cmd.push(...options.args);
  await $(cmd);
}
