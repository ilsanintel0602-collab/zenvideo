# Lab 1: 대화 핸들러

## 학습 목표

- `Conversation` 클래스로 메시지 수신/송신 구현
- `channel: "*"` 와일드카드로 모든 채널 처리
- 사용자 입력 텍스트 추출 및 응답 전송

---

## 핵심 개념

### Conversation이란?

Botpress ADK에서 **사용자와 봇 간의 대화를 처리**하는 진입점입니다.

```
사용자 메시지 → [Conversation Handler] → 봇 응답
```

### 메시지 타입

`handler`의 `props.type`에는 두 가지가 옵니다:
- `"message"` — 사용자가 메시지를 보냄
- `"workflow_callback"` — 백그라운드 워크플로우가 완료됨 (Lab 5에서 구현)

---

## Step 1: starter.ts 열기

`lab/lab1-conversation/starter.ts` 파일을 열고 TODO 부분을 채워보세요.

---

## Step 2: 핵심 패턴 이해

### 메시지 전송 형식

```typescript
// ✅ 올바른 형식
await conversation.send({ type: "text", payload: { text: "안녕하세요!" } });

// ❌ 잘못된 형식 (오류 발생)
await conversation.send("text", { text: "안녕하세요!" });
```

### 사용자 입력 추출

```typescript
const { message, conversation } = props;
const topic: string = message?.payload?.text ?? "";

// 빈 메시지 무시
if (!topic.trim()) return;
```

---

## Step 3: 구현

`src/conversations/index.ts` 파일을 starter.ts를 참고해 구현합니다.

```typescript
import { Conversation } from "@botpress/runtime";

export default new Conversation({
  channel: "*",
  handler: async (props: any) => {
    const { type, message, conversation } = props;

    // 워크플로우 콜백은 Lab 5에서 구현 (지금은 건너뜀)
    if (type === "workflow_callback") return;

    // 사용자 메시지 처리
    const topic: string = message?.payload?.text ?? "";
    if (!topic.trim()) return;

    // TODO: 응답 전송
    await conversation.send({
      type: "text",
      payload: { text: `주제 "${topic}"로 영상을 만들겠습니다!` }
    });
  },
});
```

---

## Step 4: 테스트

```bash
# 터미널 1
adk dev

# 터미널 2
adk chat
```

"인공지능의 미래"를 입력 → 에코 응답 확인

---

## 완료 기준

- [ ] `adk chat`에서 메시지 입력 시 응답 수신
- [ ] 빈 메시지 입력 시 응답 없음

완료 후 **Lab 2**로 이동!
