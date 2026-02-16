---
name: start
description: 진단 대화 시작점. 학습자의 직무/경력/AI 경험/사전 지식/학습 목적을 5문항으로 파악하고 학습 경로를 제안할 때 사용.
---

# Start Skill

이 스킬은 `/start` 진입 시 사용한다.

## 목표

- 5문항 진단으로 학습자 프로필 생성
- 학습 모드(`module1~6`) 또는 탐색 모드(`explore`) 시작점 결정
- 결과를 `data/learner-profile.json`에 저장

## 진단 규칙

- 문항은 한 번에 하나씩 제시한다.
- 모든 문항은 번호 선택형으로 제시한다.
- 학습자가 자유서술로 답하면 가장 가까운 번호로 재확인한다.
- 이름, 연락처 등 개인식별정보는 요청하지 않는다.

## 진단 5문항

1. 직무
   1) 데이터 엔지니어링
   2) 데이터 분석
   3) PM/기획
   4) 개발
   5) 기타
2. 경력 수준
   1) 주니어
   2) 미들
   3) 시니어
   4) 리드/매니저
3. AI 활용 수준
   1) 거의 안 써봄
   2) 가끔 사용
   3) 자주 사용
   4) 여러 도구 비교 사용
4. 사전 지식
   1) Token
   2) Context Window
   3) RAG
   4) Agent
   5) 거의 모름
5. 학습 목적
   1) 원리 중심 학습
   2) 트렌드/키워드 탐색
   3) 둘 다
   4) 팀 도입/전략 중심

## 경로 추천 규칙

- 목적 `2`이면 `explore` 우선 진입
- 목적 `4`이면 `module6-strategy` 우선 진입 후 필요 시 `module3~5` 보강
- 그 외에는 `module1-llm-basics`부터 순차 진행
- 경험 `1~2` + 사전 지식 `5`는 모듈 진행 속도를 낮추고 예시를 늘린다

## 출력 형식

진단 종료 후 아래를 반드시 제공한다.

1. 학습자 요약(3줄 이내)
2. 추천 시작 모듈 1개
3. 다음 선택지 2개 이상

## 저장 스키마

진단 완료 시 `data/learner-profile.template.json`을 `data/learner-profile.json`으로 복사한 뒤 결과를 갱신한다.
(이미 `learner-profile.json`이 있으면 복사 없이 갱신만 한다.)

- `diagnosis_completed`
- `updated_at`
- `profile.role`
- `profile.seniority`
- `profile.ai_experience`
- `profile.prior_knowledge`
- `profile.goal`
- `recommendation.start_skill`
- `recommendation.reason`
