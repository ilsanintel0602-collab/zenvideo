# Lab 4: Workflow 오케스트레이션

## 학습 목표

- `Workflow` 클래스로 장시간 실행 파이프라인 구현
- `step()` 함수로 단계별 실행 + 자동 재시도
- 3단계 파이프라인 연결 (이미지 → 나레이션 → 영상 조립)

---

## 핵심 개념

### Workflow란?

**Workflow**는 여러 단계를 순서대로 실행하는 장시간 백그라운드 프로세스입니다.

```
Conversation → workflow.start() → [Step 1] → [Step 2] → [Step 3] → callback
```

특징:
- `timeout: "15m"` — 최대 15분 실행 가능
- 각 Step 결과가 **캐싱됨** — 실패시 해당 Step부터 재시도
- Conversation과 **분리** — 사용자는 즉시 응답 받고 영상은 나중에 완성

### step() 함수

```typescript
const result = await step(
  "step-name",          // 고유한 단계 이름 (재시도 키)
  async () => { ... },  // 실행할 비동기 함수
  { maxAttempts: 2 }    // 옵션: 최대 재시도 횟수
);
```

`step()` 내부 함수의 반환값이 `result`에 담깁니다.

---

## Step 1: starter.ts 구조 이해

`lab/lab4-workflow/videoAutomation.starter.ts`를 열어보세요.

**파이프라인 흐름**:
```
input: { jobId, topic, hook, story[6], imagePrompts[6], thumbnailPrompt }
  ↓
Step 1: generateImages(imagePrompts, thumbnailPrompt)
  → imageUrls[6], thumbnailUrl
  ↓
Step 2: generateNarration(hook, story)
  → narrationUrl
  ↓
Step 3: assembleVideo(imageUrls, hook, story, thumbnailUrl, narrationUrl)
  → finalVideoUrl
  ↓
output: { finalVideoUrl, thumbnailUrl, jobId }
```

---

## Step 2: safeUpsert 패턴

Table 업데이트 오류가 발생해도 워크플로우가 중단되지 않도록 합니다:

```typescript
const safeUpsert = async (rows: any[]) => {
  try {
    await videoJobs.upsertRows({ rows, keyColumn: "jobId" });
  } catch (_) {}  // 오류 무시 (비중요 작업)
};
```

---

## Step 3: 구현

`lab/lab4-workflow/videoAutomation.starter.ts`의 TODO를 완성하세요.
완성 후 `src/workflows/videoAutomation.ts`에 복사.

---

## Step 4: assembleVideo.ts 이해

`src/helpers/assembleVideo.ts`를 읽어보세요 (이미 완성됨):
- Shotstack API로 슬라이드쇼 영상 조립
- 6개 이미지 × 5초 = 30초 MP4
- Ken Burns 줌인 효과 + 자막 오버레이
- 나레이션 soundtrack 추가
- 폴링: 5초 간격, 최대 5분 대기

---

## Step 5: Conversation에서 Workflow 시작

`src/conversations/index.ts`에 추가:

```typescript
import videoAutomation from "../workflows/videoAutomation";

// handler 내부 (generateshorts 호출 후):
await videoAutomation.start({
  jobId,
  topic,
  conversationId: conversation.id,
  hook: contentPlan.hook,
  story: contentPlan.story,
  imagePrompts: contentPlan.imagePrompts,
  videoPrompts: contentPlan.videoPrompts,
  thumbnailPrompt: contentPlan.thumbnailPrompt,
});
```

---

## 테스트

```bash
adk chat
```

주제 입력 → "영상 생성을 시작합니다!" 응답 확인 → 3~5분 대기

`adk_get_dev_logs`로 각 Step 진행상황 모니터링 가능

---

## 완료 기준

- [ ] `videoAutomation` Workflow 구현 (3개 step)
- [ ] `maxAttempts: 2` 재시도 설정
- [ ] Conversation에서 `videoAutomation.start()` 호출
- [ ] `adk chat`으로 전체 파이프라인 실행 성공

완료 후 **Lab 5**로 이동!
