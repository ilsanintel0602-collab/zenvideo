# Botpress ADK 실습: YouTube Shorts 영상 자동화 봇

> **강사용 배포 레포지토리** — 학생들이 이 레포를 클론하여 실습을 진행합니다.

## 시작하기 (학생)

### 1. 클론 & 설치
```bash
git clone https://github.com/[강사계정]/botpress-shorts-lab
cd botpress-shorts-lab
pnpm install
```

### 2. Botpress 계정 생성 & 로그인
```bash
# Botpress Cloud 계정: https://app.botpress.cloud
adk login
```

### 3. API 키 설정
`.env.example` → `.env` 로 복사 후 실제 키 입력:
```bash
cp .env.example .env
# .env 파일을 열어서 API 키 입력
```

### 4. 개발 서버 시작
```bash
adk dev
```

### 5. 채팅 테스트
```bash
adk chat
```

---

## 실습 커리큘럼

| Lab | 주제 | 시간 |
|-----|------|------|
| Lab 0 | 환경 설정 | 30분 |
| Lab 1 | 대화 핸들러 | 30분 |
| Lab 2 | Action & LLM | 45분 |
| Lab 3 | 이미지 & 오디오 | 60분 |
| Lab 4 | Workflow 오케스트레이션 | 60분 |
| Lab 5 | 상태 추적 & 콜백 | 45분 |

각 Lab의 가이드: `lab/labX-xxx/GUIDE.md`

---

## Claude Code Skills (AI 튜터)

Claude Code가 설치된 환경에서:
```
/botpress-lab    # 현재 단계 실습 가이드 요청
/botpress-check  # 내 코드 자동 검증
```

---

## 필요한 API 키

| 서비스 | 발급 URL | 비용 |
|--------|----------|------|
| OpenAI | https://platform.openai.com/api-keys | ~$0.30/영상 |
| Shotstack | https://dashboard.shotstack.io | 무료 10회/일 |

---

## 완성된 파이프라인

```
사용자 입력 (주제)
    ↓ GPT-4.1 콘텐츠 기획
    ↓ DALL-E 3 이미지 7장 (병렬)
    ↓ OpenAI TTS 한국어 나레이션
    ↓ Shotstack 슬라이드쇼 조립
    → 30초 MP4 영상 URL 반환
```
