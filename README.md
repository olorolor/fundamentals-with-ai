# AI for AI — AI가 직접 가르치는 AI 교육 프로그램

> Claude Code의 Skills 기능을 활용하여, AI 튜터가 학습자와 1:1 대화하며
> LLM/AI Agent 개념을 가르치는 교육 프로그램입니다.

---

## 어떻게 가르치는가 — 설계 원칙

이 프로그램의 핵심은 "무엇을 가르치는가"보다 **"AI 튜터가 어떻게 가르치는가"** 입니다. 아래 원칙들이 모든 모듈에 공통으로 적용됩니다.

### What은 고정, How는 자유

학습 목표와 이해 기준은 고정합니다. 하지만 어떤 질문을 던질지, 어떤 비유를 쓸지, 어떤 순서로 설명할지는 AI가 학습자에 맞춰 자유롭게 판단합니다. AI가 스크립트를 읽듯 경직되지 않으면서도 학습 목표를 벗어나지 않게 하기 위한 균형입니다.

### 소크라테스식 질문

답을 먼저 주지 않습니다. 질문을 통해 학습자가 스스로 발견하도록 유도합니다. AI가 질문을 던졌으면 거기서 멈추고, 학습자의 응답을 기다립니다.

### 동적 인터랙션

학습자의 응답 패턴을 보고 선택지형(번호)과 서술형(자유 타이핑)의 비율을 자동 조절합니다. 번호만 누르면 수동적 학습이 되고, 서술형만 요구하면 부담이 커지기 때문입니다.

### 두 가지 모드

**학습 모드** — 개념을 깊이 이해하는 것이 목표. 소크라테스식 질문과 이해도 확인이 작동합니다.

**탐색 모드** — 키워드와 트렌드를 빠르게 훑는 것이 목표. 사전(dictionary)처럼 간결하게 설명하되, 학습자와의 대화는 유지합니다.

두 모드는 언제든 전환 가능합니다.

### 진단 → 맞춤형 시작

교육 시작 시 5개의 번호 선택 질문(직무, 직급, AI 경험, 사전 지식, 학습 목적)으로 학습자를 파악합니다. 이 결과에 따라 비유의 맥락, 설명의 깊이, 시작 모듈, 학습 모드가 달라집니다.

---

## 시작하기

아래 한 줄을 터미널에 붙여넣으세요:

```bash
npx skills add olorolor/fundamentals-with-ai --yes && claude /start
```

**사전 요구사항**: [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) 설치 필요

---

## 프로젝트 구조

```
fundamentals-with-ai/
├── CLAUDE.md                          # 교육 진행 방식 (How) — 항상 자동 로드
└── .claude/skills/
    ├── start/SKILL.md                 # 진단 대화 (진입점)
    ├── module1-llm-basics/SKILL.md    # Module 1~6: 교육 내용 (What)
    ├── module2-tokens-context/SKILL.md
    ├── module3-rag-embedding/SKILL.md
    ├── module4-agent/SKILL.md
    ├── module5-tools-ecosystem/SKILL.md
    ├── module6-strategy/SKILL.md
    ├── explore/SKILL.md               # 탐색 모드 정의 (What)
    └── review/SKILL.md                # 복습 & 종합 정리
```

`CLAUDE.md`(How)는 어떤 Skill이 활성화되든 항상 자동 로드됩니다. 각 `SKILL.md`(What)는 해당 모듈의 학습 목표, 개념, 이해 기준만 정의합니다.
