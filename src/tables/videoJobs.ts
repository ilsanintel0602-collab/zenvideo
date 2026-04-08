/**
 * videoJobs Table — Lab 5에서 구현합니다.
 *
 * 영상 생성 작업의 상태를 추적하는 테이블입니다.
 * lab/lab5-table/videoJobs.starter.ts 를 참고하여 구현하세요.
 */

import { Table, z } from "@botpress/runtime";

// TODO Lab 5: 아래 Table 정의를 완성하세요
// lab/lab5-table/videoJobs.starter.ts 참고
export default new Table({
  name: "videoJobsTable",
  description: "Tracks end-to-end YouTube Shorts video generation jobs",
  columns: {
    jobId:             { schema: z.string() },
    topic:             { schema: z.string() },
    status:            { schema: z.enum(["pending", "processing", "done", "failed"]) },
    hook:              { schema: z.string().optional() },
    story:             { schema: z.string().optional() },
    imageUrlsJson:     { schema: z.string().optional() },
    videoClipUrlsJson: { schema: z.string().optional() },
    finalVideoUrl:     { schema: z.string().optional() },
    thumbnailUrl:      { schema: z.string().optional() },
    conversationId:    { schema: z.string() },
    errorMessage:      { schema: z.string().optional() },
    startedAt:         { schema: z.string() },
    completedAt:       { schema: z.string().optional() },
  },
  keyColumn: "jobId",
});
