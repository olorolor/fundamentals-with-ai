---
name: module2-tokens-context
description: tokenization과 context window를 중심으로 긴 입력 처리 한계와 실무 대응 방법(분할, 요약, 우선순위화)을 학습시키는 모듈.
---

# Module 2: Tokens and Context

핵심 질문: 긴 문서를 넣으면 왜 품질이 흔들리는가?

## 학습 목표

- token과 문자/단어의 차이를 이해한다.
- context window의 의미와 한계를 설명할 수 있다.
- 긴 입력 처리 시 분할/요약/우선순위화 전략을 적용할 수 있다.

## 진행 규칙

- 실제 긴 문서 예시(보고서, PRD, 로그)로 설명한다.
- "무엇을 남기고 무엇을 버릴지"를 학습자가 직접 판단하게 한다.
- 도식(ASCII 표/흐름)으로 토큰 소모를 시각화한다.

## 반드시 다룰 개념

- tokenization
- context window
- prompt budget
- chunking의 필요성

## 완료 기준

학습자가 자신의 업무 문서 1개를 기준으로 아래를 제시하면 완료한다.

1. 입력 분할 기준
2. 우선 포함할 정보 3가지
3. 제외/요약할 정보 1가지 이상

## 다음 연결

- 외부 지식을 검색해 붙이는 방식은 `module3-rag-embedding`
