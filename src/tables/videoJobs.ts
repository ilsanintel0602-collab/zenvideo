/**
 * videoJobs Table — Lab 5 완성본
 * 
 * 영상 생성 작업의 상태를 추적하는 테이블입니다.
 */
import { Table, z } from "@botpress/runtime";

export default new Table({
  name: "videoJobs",
  description: "Tracks end-to-end YouTube Shorts video generation jobs",
  columns: {
    jobId:             { schema: z.string() },
    topic:             { schema: z.string() },
    status:            { schema: z.string() },
    hook:              { schema: z.string().optional() },
    story:             { schema: z.string().optional() },
    finalVideoUrl:     { schema: z.string().optional() },
    thumbnailUrl:      { schema: z.string().optional() },
    conversationId:    { schema: z.string() },
    completedAt:       { schema: z.string().optional() },
  },
  keyColumn: "jobId",
});
