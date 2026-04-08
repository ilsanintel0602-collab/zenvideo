# Botpress ADK 실습 코드 자동 검증

학생의 현재 코드를 읽고 실습 완성 여부를 검증합니다.

## 검증 순서

다음 파일들을 순서대로 읽고 각 항목을 체크하세요:

### 1. 대화 핸들러 검증 (`src/conversations/index.ts`)
읽은 후 확인:
- [ ] `new Conversation({ channel: "*", handler: ... })` 구조 존재
- [ ] `message.payload.text`로 topic 추출
- [ ] `conversation.send({ type: "text", payload: { text } })` 형식으로 응답
- [ ] `type === "workflow_callback"` 처리 블록 존재
- [ ] `videoAutomation.start(...)` 호출

### 2. Action 검증 (`src/actions/generateshorts.ts`)
읽은 후 확인:
- [ ] `new Action({ name: "generateshorts", ... })` 구조
- [ ] `adk.zai.extract()` 사용
- [ ] 출력 스키마에 `hook`, `story[6]`, `imagePrompts[6]`, `videoPrompts[6]`, `thumbnailPrompt` 포함
- [ ] Korean/English 분리 instructions

### 3. 이미지 생성 검증 (`src/helpers/generateImages.ts`)
읽은 후 확인:
- [ ] `process.env.OPENAI_API_KEY` 사용
- [ ] DALL-E 3 API 호출 (`https://api.openai.com/v1/images/generations`)
- [ ] `size: "1024x1792"` (9:16 세로)
- [ ] `Promise.all()` 병렬 처리

### 4. 나레이션 검증 (`src/helpers/generateNarration.ts`)
읽은 후 확인:
- [ ] OpenAI TTS API 호출 (`https://api.openai.com/v1/audio/speech`)
- [ ] `voice: "nova"`, `response_format: "mp3"`
- [ ] catbox.moe 업로드 (`https://catbox.moe/user/api.php`)
- [ ] URL `http`로 시작하는지 검증

### 5. 워크플로우 검증 (`src/workflows/videoAutomation.ts`)
읽은 후 확인:
- [ ] `new Workflow({ timeout: "15m", ... })` 구조
- [ ] `step("generate-images", ...)` — Step 1
- [ ] `step("generate-narration", ...)` — Step 2
- [ ] `step("assemble-video", ...)` — Step 3
- [ ] `maxAttempts: 2` 재시도 설정
- [ ] `safeUpsert` 패턴 (try/catch로 Table 오류 무시)

### 6. Table 검증 (`src/tables/videoJobs.ts`)
읽은 후 확인:
- [ ] `new Table({ name: "videoJobsTable", ... })` 구조
- [ ] `status` 컬럼에 `"pending" | "processing" | "done" | "failed"` enum
- [ ] `keyColumn: "jobId"` 설정

### 7. 환경변수 검증 (`.env`)
읽은 후 확인:
- [ ] `OPENAI_API_KEY` 존재 및 `sk-`로 시작
- [ ] `SHOTSTACK_API_KEY` 존재
- [ ] `SHOTSTACK_ENV` 존재 (`stage` 또는 `production`)

## 검증 결과 출력 형식

```
## 실습 검증 결과

### Lab 1 대화 핸들러: ✅ 완료 / ⚠️ 일부 미완 / ❌ 미완
- [체크 항목별 결과]

### Lab 2 Action: ...
...

### 종합 점수: X/7 완료

### 다음 단계: [미완성 항목 기반 조언]
```

## 검증 후 안내

- 모든 항목 완료 → `adk chat`으로 전체 파이프라인 테스트 진행
- 미완성 항목 있음 → 해당 Lab 가이드 참고 (`/botpress-lab` 사용)
- 오류 의심 → `adk dev` 로그 확인 (`adk_get_dev_logs` 도구 사용)
