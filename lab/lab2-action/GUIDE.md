# Lab 2: Action & LLM

## 학습 목표

- `Action` 클래스로 재사용 가능한 LLM 로직 구현
- `adk.zai.extract()`로 LLM 출력을 Zod 스키마로 구조화
- Conversation에서 Action 호출

---

## 핵심 개념

### Action이란?

**Action**은 재사용 가능한 비즈니스 로직 단위입니다. LLM 호출, 계산, 외부 API 호출 등을 캡슐화합니다.

```
Conversation → actions.generateshorts({ topic }) → 구조화된 콘텐츠 기획
```

### zai.extract()란?

LLM에게 자유로운 텍스트를 주고, **Zod 스키마에 맞는 구조화된 JSON**을 받는 함수입니다.

```typescript
const result = await adk.zai.extract(
  입력텍스트,      // LLM에게 줄 내용
  Zod스키마,       // 원하는 출력 형태
  { instructions: "LLM 지시사항" }
);
```

---

## Step 1: Zod 스키마 이해

```typescript
import { z } from "@botpress/runtime";

// 기본 타입
z.string()                    // 문자열
z.number()                    // 숫자
z.boolean()                   // 불리언
z.array(z.string())           // 문자열 배열
z.array(z.string()).length(6) // 정확히 6개인 문자열 배열
z.object({ key: z.string() }) // 객체
```

---

## Step 2: starter.ts 구현

`lab/lab2-action/starter.ts`의 TODO를 완성하세요.

**출력 스키마 구조**:
```typescript
{
  hook: string,                    // 훅 (한국어, 1줄)
  story: string[6],                // 스토리 (한국어, 6줄)
  imagePrompts: string[6],         // 이미지 프롬프트 (영어, 6개)
  videoPrompts: string[6],         // 영상 프롬프트 (영어, 6개)
  thumbnailPrompt: string,         // 썸네일 프롬프트 (영어, 1개)
}
```

**LLM 지시사항 (instructions)**:
- YouTube Shorts 콘텐츠 전략가 역할
- hook, story는 한국어로
- imagePrompts, videoPrompts, thumbnailPrompt는 영어로

---

## Step 3: Conversation에서 호출

`src/conversations/index.ts`에 추가:

```typescript
import { actions } from "@botpress/runtime";

// handler 내부:
const contentPlan = await actions.generateshorts({ topic });
// contentPlan.hook, contentPlan.story, contentPlan.imagePrompts 등 사용 가능
```

---

## Step 4: 테스트

```bash
adk chat
```

"인공지능이 바꾸는 미래 직업" 입력 후 결과 확인:
- 훅 1줄 (한국어)
- 스토리 6줄 (한국어)
- 이미지 프롬프트 6개 (영어)
- 썸네일 프롬프트 1개 (영어)

---

## 완료 기준

- [ ] `generateshorts` Action 구현 완료
- [ ] Conversation에서 `actions.generateshorts()` 호출
- [ ] `adk chat`에서 한국어 훅/스토리 + 영어 프롬프트 수신

완료 후 **Lab 3**으로 이동!
