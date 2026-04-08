# Lab 0: 환경 설정

## 학습 목표

- Botpress ADK CLI 설치
- API 키 발급 및 `.env` 설정
- 첫 봇 실행(`adk dev`) 및 채팅 테스트(`adk chat`)

---

## Step 1: 사전 요구사항 확인

```bash
node --version   # v20 이상 필요
npm --version
```

Node.js가 없으면 https://nodejs.org 에서 LTS 버전 설치

---

## Step 2: 패키지 매니저 설치

```bash
npm install -g pnpm
pnpm --version   # 출력되면 성공
```

---

## Step 3: Botpress ADK CLI 설치

```bash
npm install -g @botpress/adk
adk --version    # 출력되면 성공
```

---

## Step 4: 새 프로젝트 생성

```bash
adk new my-shorts-bot
cd my-shorts-bot
```

생성된 파일 구조:
```
my-shorts-bot/
├── agent.config.ts     ← 봇 설정
├── agent.json          ← Cloud 연동 정보
├── .env                ← API 키 (gitignore됨)
├── src/
│   ├── conversations/  ← 대화 핸들러
│   ├── actions/        ← AI 액션
│   ├── workflows/      ← 백그라운드 워크플로우
│   ├── helpers/        ← 외부 API 헬퍼
│   └── tables/         ← 데이터베이스
└── package.json
```

---

## Step 5: API 키 발급

### OpenAI API 키
1. https://platform.openai.com 접속
2. API Keys 메뉴 → Create new secret key
3. 복사해두기 (`sk-proj-...` 형식)

### Shotstack API 키
1. https://dashboard.shotstack.io 접속
2. 무료 계정 생성
3. API Keys → Stage 키 복사

---

## Step 6: .env 파일 설정

프로젝트 루트에 `.env` 파일 생성:

```
OPENAI_API_KEY=sk-proj-여기에_실제_키_입력
SHOTSTACK_API_KEY=여기에_실제_키_입력
SHOTSTACK_ENV=stage
```

> **주의**: `.env` 파일은 절대 git에 올리지 마세요!

---

## Step 7: 개발 서버 시작

```bash
pnpm install     # 의존성 설치
adk dev          # 개발 서버 시작
```

"Server started" 또는 "Listening on port..." 메시지 확인

---

## Step 8: 채팅 테스트

새 터미널 창에서:

```bash
adk chat
```

"안녕하세요"를 입력하고 응답이 오면 성공!

---

## 체크리스트 (`checklist.md` 참고)

모든 항목이 체크되면 **Lab 1**으로 진행하세요.
