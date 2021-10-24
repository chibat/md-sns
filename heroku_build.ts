#!/usr/bin/env -S deno run -A --unstable

import { $ } from "./tasks_utils.ts";

await $(["bash", "-c", "deno cache --import-map=import_map.json --no-check --unstable --reload *.ts *.ts */*.ts */*.tsx */*/*.tsx */*/*/*.tsx"]);



