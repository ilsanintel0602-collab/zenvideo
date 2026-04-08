/**
 * Lab 5: 상태 추적 Table (starter)
 *
 * 영상 생성 작업의 상태를 추적하는 데이터베이스 테이블입니다.
 * TODO를 완성 후 src/tables/videoJobs.ts에 복사하세요.
 */

import { Table, z } from "@botpress/runtime";

export default new Table({
  // TODO 1: 테이블 이름을 설정하세요
  name: /* TODO */ "",
  description: "Tracks end-to-end YouTube Shorts video generation jobs",

  columns: {
    // TODO 2: 기본 키 — 작업 ID (문자열)
    jobId: { schema: /* TODO */ },

    // TODO 3: 주제 — 사용자가 입력한 주제 (문자열)
    topic: { schema: /* TODO */ },

    // TODO 4: 상태 — "pending" | "processing" | "done" | "failed" 중 하나
    // 힌트: z.enum(["pending", "processing", "done", "failed"])
    status: { schema: /* TODO */ },

    // TODO 5: 훅 — LLM이 생성한 주의 끌기 문구 (선택적 문자열)
    // 힌트: z.string().optional()
    hook: { schema: /* TODO */ },

    // TODO 6: 나머지 선택적 컬럼들 (모두 z.string().optional())
    story:             { schema: z.string().optional() }, // JSON.stringify(string[6])
    imageUrlsJson:     { schema: z.string().optional() }, // JSON.stringify(string[7])
    videoClipUrlsJson: { schema: z.string().optional() }, // JSON.stringify(string[6])
    finalVideoUrl:     { schema: z.string().optional() },
    thumbnailUrl:      { schema: z.string().optional() },
    conversationId:    { schema: z.string() },
    errorMessage:      { schema: z.string().optional() },
    startedAt:         { schema: z.string() },             // ISO 타임스탬프
    completedAt:       { schema: z.string().optional() },  // ISO 타임스탬프
  },

  // TODO 7: 기본 키 컬럼을 설정하세요
  keyColumn: /* TODO */,
});
