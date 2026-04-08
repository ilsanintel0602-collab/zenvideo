# Lab 3: 이미지 & 오디오 생성

## 학습 목표

- DALL-E 3 API로 9:16 세로 이미지 생성
- `Promise.all()`로 병렬 API 호출 구현
- OpenAI TTS API로 한국어 나레이션 MP3 생성
- catbox.moe에 파일 업로드하여 CDN URL 획득

---

## 핵심 개념

### Helper 함수란?

**Helper**는 외부 API와 통신하는 순수 TypeScript 함수입니다. Action, Workflow에서 직접 import하여 사용합니다.

```
Workflow → generateImages(prompts) → DALL-E 3 API → imageUrls[]
Workflow → generateNarration(hook, story) → TTS API → catbox.moe → URL
```

### 환경변수 사용 패턴

```typescript
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되지 않았습니다");
```

---

## Part A: 이미지 생성 (generateImages)

### DALL-E 3 API 엔드포인트

```
POST https://api.openai.com/v1/images/generations
```

### 요청 본문

```json
{
  "model": "dall-e-3",
  "prompt": "...",
  "n": 1,
  "size": "1024x1792",      // 9:16 세로 (YouTube Shorts)
  "quality": "standard",
  "response_format": "url"
}
```

### Promise.all() 병렬 처리

```typescript
// 순차 처리 (느림: 7 × 15초 = 105초)
for (const prompt of prompts) {
  const url = await generateOne(prompt, apiKey);
}

// 병렬 처리 (빠름: 최대 15초)
const urls = await Promise.all(
  prompts.map((p) => generateOne(p, apiKey))
);
```

---

## Part B: 나레이션 생성 (generateNarration)

### OpenAI TTS API

```
POST https://api.openai.com/v1/audio/speech
```

```json
{
  "model": "tts-1",
  "input": "스크립트 전체 텍스트",
  "voice": "nova",           // 한국어 지원 보이스
  "response_format": "mp3",
  "speed": 1.0
}
```

### catbox.moe 파일 업로드

무료 영구 파일 호스팅 서비스. 인증 불필요.

```typescript
const formData = new FormData();
formData.append("reqtype", "fileupload");
formData.append(
  "fileToUpload",
  new Blob([audioBuffer], { type: "audio/mpeg" }),
  "narration.mp3"
);

const res = await fetch("https://catbox.moe/user/api.php", {
  method: "POST",
  body: formData,
});
const url = (await res.text()).trim(); // "https://files.catbox.moe/xxxx.mp3"
```

---

## Step 1: generateImages 구현

`lab/lab3-helpers/generateImages.starter.ts`의 TODO를 완성하세요.
완성 후 `src/helpers/generateImages.ts`에 복사.

## Step 2: generateNarration 구현

`lab/lab3-helpers/generateNarration.starter.ts`의 TODO를 완성하세요.
완성 후 `src/helpers/generateNarration.ts`에 복사.

---

## 완료 기준

- [ ] `generateImages()` 구현 — imageUrls[6] + thumbnailUrl 반환
- [ ] `generateNarration()` 구현 — narrationUrl (http로 시작) 반환
- [ ] `Promise.all()` 병렬 처리 적용

완료 후 **Lab 4**로 이동!
