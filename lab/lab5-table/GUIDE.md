# Lab 5: 상태 추적 & 콜백

## 학습 목표

- `Table`로 작업 상태를 데이터베이스에 저장
- `createRows()` / `upsertRows()`로 데이터 생성/갱신
- `workflow_callback` 이벤트로 완료 알림 구현

---

## 핵심 개념

### Table이란?

Botpress 내장 데이터베이스 테이블입니다. Zod 스키마로 컬럼을 정의합니다.

```typescript
import { Table, z } from "@botpress/runtime";

export default new Table({
  name: "videoJobsTable",
  columns: {
    jobId:  { schema: z.string() },
    status: { schema: z.enum(["pending", "processing", "done", "failed"]) },
    // ...
  },
  keyColumn: "jobId",  // 기본 키
});
```

### CRUD 작업

```typescript
// 새 행 생성
await videoJobs.createRows({ rows: [{ jobId: "job_1", status: "pending" }] });

// 키 기반 갱신 (없으면 생성)
await videoJobs.upsertRows({
  rows: [{ jobId: "job_1", status: "done", finalVideoUrl: "https://..." }],
  keyColumn: "jobId",
});
```

### 작업 상태 흐름

```
pending → processing → done
                    ↘ failed
```

---

## workflow_callback 처리

Workflow가 완료되면 Conversation Handler의 `type === "workflow_callback"` 블록이 실행됩니다.

```typescript
if (type === "workflow_callback" && completion) {
  if (completion.status === "completed" && completion.output) {
    // 성공: 영상 URL 전송
    const { finalVideoUrl, thumbnailUrl } = completion.output;
    await conversation.send({
      type: "text",
      payload: { text: `영상 URL: ${finalVideoUrl}` }
    });
  } else {
    // 실패: 오류 메시지 전송
    await conversation.send({
      type: "text",
      payload: { text: `실패: ${completion.error}` }
    });
  }
}
```

---

## Step 1: Table 정의

`lab/lab5-table/videoJobs.starter.ts`의 TODO를 완성하세요.
완성 후 `src/tables/videoJobs.ts`에 복사.

---

## Step 2: Conversation에 workflow_callback 추가

`src/conversations/index.ts` 상단의 `if (type === "workflow_callback") return;` 부분을 교체:

```typescript
if (type === "workflow_callback" && completion) {
  // 성공/실패 처리
  return;
}
```

---

## Step 3: Conversation에서 Table 사용

```typescript
import videoJobs from "../tables/videoJobs";

// Job 생성 (메시지 수신 시)
const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
await videoJobs.createRows({
  rows: [{
    jobId,
    topic,
    status: "pending",
    conversationId: conversation.id,
    startedAt: new Date().toISOString(),
    hook: contentPlan.hook,
    story: JSON.stringify(contentPlan.story),
  }],
});
```

---

## 테스트

```bash
adk chat
```

주제 입력 → 3~5분 후 완료 메시지 + 영상 URL 수신 확인

Botpress Cloud 대시보드 → Tables → videoJobsTable에서 레코드 확인

---

## 완료 기준

- [ ] `videoJobs` Table 정의 완료
- [ ] Conversation에서 `createRows()` 호출
- [ ] `workflow_callback` 처리 블록 구현
- [ ] 성공 시 영상 URL, 실패 시 오류 메시지 전송

**전체 실습 완료!** `adk chat`으로 최종 테스트를 진행하세요.
