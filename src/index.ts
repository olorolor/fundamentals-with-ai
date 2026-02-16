#!/usr/bin/env node

import { existsSync, mkdirSync, rmSync } from "node:fs";
import { parseArgs } from "./config.js";
import { runApp } from "./app.js";

async function main(): Promise<void> {
  const config = parseArgs(process.argv.slice(2));

  // Handle --reset flag
  if (process.argv.includes("--reset")) {
    if (existsSync(config.dataDir)) {
      rmSync(config.dataDir, { recursive: true });
      console.log("학습 데이터가 초기화되었습니다.");
    }
  }

  // Ensure data directory exists
  if (!existsSync(config.dataDir)) {
    mkdirSync(config.dataDir, { recursive: true });
  }

  await runApp(config);
}

main().catch((err: Error) => {
  console.error(`\n오류가 발생했습니다: ${err.message}`);
  process.exit(1);
});
