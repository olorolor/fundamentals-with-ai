import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { AppConfig } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function parseArgs(argv: string[]): AppConfig {
  let webhookUrl: string | undefined;
  let model: string | undefined;
  let resume = false;
  let dataDir: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case "--webhook":
        webhookUrl = argv[++i];
        break;
      case "--model":
        model = argv[++i];
        break;
      case "--resume":
        resume = true;
        break;
      case "--data-dir":
        dataDir = argv[++i];
        break;
      case "--reset":
        // Handled in index.ts before app starts
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
    }
  }

  return {
    dataDir: dataDir || resolve(process.cwd(), "ai-for-ai-data"),
    contentDir: resolve(__dirname, "..", "content"),
    webhookUrl,
    model,
    resume,
  };
}

function printHelp(): void {
  console.log(`
ai-for-ai - AI가 직접 가르치는 AI 교육 프로그램

사용법:
  npx ai-for-ai [옵션]

옵션:
  --webhook <url>     학습 진행 상황을 전송할 webhook URL
  --model <model>     사용할 Claude 모델 (기본: claude-sonnet-4-5-20250929)
  --resume            마지막 진행 중인 모듈 세션 이어서 시작
  --data-dir <path>   데이터 저장 디렉토리 (기본: ./ai-for-ai-data)
  --reset             학습자 프로필 초기화 후 시작
  -h, --help          도움말 표시
`);
}
