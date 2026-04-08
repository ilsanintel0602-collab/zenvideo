# Botpress ADK 실습: YouTube Shorts 영상 자동화 봇

## 실습 개요

이 실습에서는 **Botpress ADK**를 사용하여 주제를 입력하면 YouTube Shorts 영상을 자동 생성하는 AI 봇을 만듭니다.

```
사용자 입력 (주제)
    ↓
GPT-4.1 콘텐츠 기획 (훅 + 스토리 6줄 + 프롬프트)
    ↓
DALL-E 3 이미지 7장 생성 (병렬)
    ↓
OpenAI TTS 한국어 나레이션 MP3 생성
    ↓
Shotstack 슬라이드쇼 영상 조립 (30초 MP4)
    ↓
사용자에게 영상 URL 전송
```

## 실습 진행 순서

| Lab | 주제 | 시간 | 파일 |
|-----|------|------|------|
| **Lab 0** | 환경 설정 | 30분 | `lab0-setup/` |
| **Lab 1** | 대화 핸들러 | 30분 | `lab1-conversation/` |
| **Lab 2** | Action & LLM | 45분 | `lab2-action/` |
| **Lab 3** | 이미지 & 오디오 | 60분 | `lab3-helpers/` |
| **Lab 4** | Workflow 오케스트레이션 | 60분 | `lab4-workflow/` |
| **Lab 5** | 상태 추적 & 콜백 | 45분 | `lab5-table/` |

**총 시간: 약 4~5시간**

## 실습 방식

각 Lab 폴더에는:
- `GUIDE.md` — 개념 설명 + 단계별 안내
- `starter.ts` — 빈 칸 채우기 템플릿 (`TODO` 주석 부분 완성)

### Claude Code로 도움 받기

Claude Code가 설치된 환경에서:
```
/botpress-lab    # 현재 단계 가이드 요청
/botpress-check  # 내 코드 자동 검증
```

## 완성된 코드 위치

막혔을 때 참고하는 완성본:
```
src/conversations/index.ts      ← Lab 1, 5 완성본
src/actions/generateshorts.ts   ← Lab 2 완성본
src/helpers/generateImages.ts   ← Lab 3 완성본
src/helpers/generateNarration.ts← Lab 3 완성본
src/helpers/assembleVideo.ts    ← Lab 4 완성본
src/workflows/videoAutomation.ts← Lab 4, 5 완성본
src/tables/videoJobs.ts         ← Lab 5 완성본
```

## 필요한 API 키

| 서비스 | 용도 | 발급 URL | 비용 |
|--------|------|----------|------|
| OpenAI | GPT-4.1 + DALL-E 3 + TTS | platform.openai.com | ~$0.30/영상 |
| Shotstack | 영상 조립 | dashboard.shotstack.io | 무료 10회/일 (stage) |

## 최종 결과물

실습 완료 후 `adk chat`에서 "인공지능의 미래"를 입력하면:
- 약 3~5분 후 30초 MP4 영상 URL 반환
- 한국어 나레이션 + 자막 + Ken Burns 줌 효과 포함
