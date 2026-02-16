import * as readline from "node:readline/promises";
import type { LearnerProfile } from "../types.js";

interface DiagnosticQuestion {
  id: string;
  question: string;
  options: string[];
  multiSelect?: boolean;
}

const QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "role",
    question: "현재 직무가 어디에 가장 가까운가요?",
    options: [
      "데이터 엔지니어링 (파이프라인, ETL, 인프라)",
      "데이터 분석 (대시보드, 리포트, 인사이트)",
      "PM / 기획 (제품 기획, 프로젝트 관리)",
      "개발 (백엔드, 프론트엔드, 게임 클라이언트 등)",
      "기타",
    ],
  },
  {
    id: "seniority",
    question: "경력 수준은 어느 정도인가요?",
    options: [
      "주니어 (1~3년차)",
      "미들 (4~7년차)",
      "시니어 (8년차 이상)",
      "리드 / 매니저",
    ],
  },
  {
    id: "ai_experience",
    question: "AI 도구를 업무에서 어느 정도 사용하고 계신가요?",
    options: [
      "거의 안 써봤다",
      "ChatGPT 등을 가끔 써본다",
      "업무에 꽤 자주 활용하고 있다",
      "AI 도구 여러 개를 비교하며 쓰고 있다",
    ],
  },
  {
    id: "prior_knowledge",
    question:
      '다음 중 "대략 무슨 뜻인지" 알고 있는 것을 모두 골라주세요.\n(모르는 게 있어도 전혀 괜찮습니다!)',
    options: ["Token", "Context Window", "RAG", "Agent", "하나도 모르겠다"],
    multiSelect: true,
  },
  {
    id: "goal",
    question: "이 교육에서 가장 원하는 것은?",
    options: [
      "AI의 핵심 원리를 제대로 이해하고 싶다",
      "AI 관련 용어와 트렌드를 빠르게 파악하고 싶다",
      "둘 다 — 원리도 알고 싶고 트렌드도 궁금하다",
      "우리 팀에서 AI를 어떻게 쓸지 판단하고 싶다",
    ],
  },
];

export async function runDiagnostic(): Promise<LearnerProfile> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\n========================================");
  console.log("  AI for AI - 학습자 진단");
  console.log("========================================");
  console.log("\n5개의 간단한 질문으로 맞춤형 학습 경로를 만들어 드릴게요.\n");

  const answers: Record<string, string | string[]> = {};

  for (const q of QUESTIONS) {
    console.log(`\n${q.question}\n`);
    q.options.forEach((opt, i) => {
      console.log(`  ${i + 1}) ${opt}`);
    });

    if (q.multiSelect) {
      console.log("\n  (번호를 쉼표로 구분, 예: 1,3)");
    }

    const response = (await rl.question("\n선택: ")).trim();

    if (q.multiSelect) {
      const indices = response
        .split(",")
        .map((s) => parseInt(s.trim()) - 1);
      const selected = indices
        .filter((i) => i >= 0 && i < q.options.length)
        .map((i) => q.options[i]!);

      // "하나도 모르겠다" selected → empty knowledge
      if (selected.includes("하나도 모르겠다")) {
        answers[q.id] = [];
      } else {
        answers[q.id] = selected.length > 0 ? selected : [response];
      }
    } else {
      const num = parseInt(response);
      if (num >= 1 && num <= q.options.length) {
        answers[q.id] = q.options[num - 1]!;
      } else {
        answers[q.id] = response;
      }
    }
  }

  rl.close();

  return buildProfile(answers);
}

function buildProfile(
  answers: Record<string, string | string[]>,
): LearnerProfile {
  const role = answers.role as string;
  const seniority = answers.seniority as string;
  const aiExperience = answers.ai_experience as string;
  const priorKnowledge = answers.prior_knowledge as string[];
  const goal = answers.goal as string;

  // Determine start skill based on routing rules from start/SKILL.md
  const { startSkill, reason } = determineRoute(
    goal,
    aiExperience,
    priorKnowledge,
  );

  return {
    diagnosis_completed: true,
    updated_at: new Date().toISOString().split("T")[0]!,
    profile: {
      role,
      seniority,
      ai_experience: aiExperience,
      prior_knowledge: priorKnowledge,
      goal,
    },
    recommendation: {
      start_skill: startSkill,
      reason,
    },
    progress: {
      completed_skills: [],
      current_skill: null,
      last_review_at: null,
    },
  };
}

function determineRoute(
  goal: string,
  aiExperience: string,
  priorKnowledge: string[],
): { startSkill: string; reason: string } {
  // Goal 2: Trend/keyword exploration → explore mode
  if (goal.includes("트렌드") || goal.includes("빠르게 파악")) {
    return {
      startSkill: "explore",
      reason: "트렌드/키워드 탐색 목적. 탐색 모드에서 자유롭게 키워드를 살펴보세요.",
    };
  }

  // Goal 4: Team strategy → module6 first
  if (goal.includes("팀") || goal.includes("판단")) {
    return {
      startSkill: "module6-strategy",
      reason:
        "팀 도입/전략 중심 학습 목적. Module 6에서 시작 후 필요한 기술 모듈을 보강합니다.",
    };
  }

  // Experience low + no prior knowledge → slow Module 1
  const isLowExperience =
    aiExperience.includes("안 써봤") || aiExperience.includes("가끔");
  const isNoKnowledge = priorKnowledge.length === 0;

  if (isLowExperience && isNoKnowledge) {
    return {
      startSkill: "module1-llm-basics",
      reason:
        "AI 경험이 적고 사전 지식이 없어 Module 1부터 천천히, 비유 중심으로 진행합니다.",
    };
  }

  // Experience high + some knowledge → fast Module 1, focus on 3-4
  const isHighExperience =
    aiExperience.includes("자주") || aiExperience.includes("비교");
  const hasPartialKnowledge = priorKnowledge.length > 0;

  if (isHighExperience && hasPartialKnowledge) {
    const missing = ["Token", "Context Window", "RAG", "Agent"].filter(
      (k) => !priorKnowledge.includes(k),
    );
    if (missing.length > 0) {
      return {
        startSkill: "module1-llm-basics",
        reason: `AI 활용 경험이 있고 일부 개념을 알지만, ${missing.join("/")} 개념 보강이 필요합니다. Module 1~2는 빠르게, Module 3~4에 집중 투자 권장.`,
      };
    }
    return {
      startSkill: "module3-rag-embedding",
      reason:
        "기본 개념을 이미 알고 있으므로 Module 3(RAG/Embedding)부터 깊이 있게 시작합니다.",
    };
  }

  // Default: sequential from Module 1
  const knownStr =
    priorKnowledge.length > 0 ? priorKnowledge.join("/") : "없음";
  return {
    startSkill: "module1-llm-basics",
    reason: `원리 중심 학습 목적. 사전 지식(${knownStr}) 기반으로 Module 1부터 순차 진행합니다.`,
  };
}
