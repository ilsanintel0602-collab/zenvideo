# Lab 0 체크리스트

## 환경 설정 완료 여부 확인

### 도구 설치
- [ ] `node --version` → v20 이상 출력
- [ ] `pnpm --version` → 버전 출력
- [ ] `adk --version` → 버전 출력

### 프로젝트 설정
- [ ] `adk new my-shorts-bot` 으로 프로젝트 생성
- [ ] `.env` 파일 생성됨
- [ ] `OPENAI_API_KEY` 입력 완료 (`sk-proj-`로 시작)
- [ ] `SHOTSTACK_API_KEY` 입력 완료
- [ ] `SHOTSTACK_ENV=stage` 입력 완료

### 실행 확인
- [ ] `pnpm install` 완료 (오류 없음)
- [ ] `adk dev` 실행 → "Server started" 확인
- [ ] `adk chat` → "안녕" 입력 → 응답 수신

## API 키 발급 링크

| 서비스 | 발급 URL |
|--------|----------|
| OpenAI | https://platform.openai.com/api-keys |
| Shotstack | https://dashboard.shotstack.io |

## 완료!

모든 항목 체크 완료 → **Lab 1: 대화 핸들러**로 이동
