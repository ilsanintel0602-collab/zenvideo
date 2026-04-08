/**
 * videoAutomation Workflow — Lab 4에서 구현합니다.
 *
 * 이미지 생성 → 나레이션 생성 → 영상 조립의 3단계 파이프라인입니다.
 * lab/lab4-workflow/videoAutomation.starter.ts 를 참고하여 구현하세요.
 */

import { Workflow, z } from "@botpress/runtime";
import videoJobs from "../tables/videoJobs";
import { generateImages } from "../helpers/generateImages";
import { generateNarration } from "../helpers/generateNarration";
import { assembleVideo } from "../helpers/assembleVideo";

export default new Workflow({
  name: "videoAutomation",
  description: "YouTube Shorts pipeline: topic → images → narration → video",
  timeout: "15m",

  input: z.object({
    jobId:           z.string(),
    topic:           z.string(),
    conversationId:  z.string(),
    hook:            z.string(),
    story:           z.array(z.string()).length(6),
    imagePrompts:    z.array(z.string()).length(6),
    videoPrompts:    z.array(z.string()).length(6),
    thumbnailPrompt: z.string(),
  }),

  output: z.object({
    finalVideoUrl: z.string(),
    thumbnailUrl:  z.string(),
    jobId:         z.string(),
  }),

  handler: async ({ input, step }) => {
    // TODO Lab 4: 아래 3개의 step()을 구현하세요
    // lab/lab4-workflow/videoAutomation.starter.ts 참고

    const safeUpsert = async (rows: any[]) => {
      try { await videoJobs.upsertRows({ rows, keyColumn: "jobId" }); } catch (_) {}
    };

    await safeUpsert([{ jobId: input.jobId, status: "processing" }]);

    // TODO: Step 1 — generate-images
    const { imageUrls, thumbnailUrl } = await step(
      "generate-images",
      async () => generateImages(input.imagePrompts, input.thumbnailPrompt),
      { maxAttempts: 2 }
    );

    // TODO: Step 2 — generate-narration
    const { narrationUrl } = await step(
      "generate-narration",
      async () => generateNarration(input.hook, input.story),
      { maxAttempts: 2 }
    );

    // TODO: Step 3 — assemble-video
    const { finalVideoUrl } = await step(
      "assemble-video",
      async () => assembleVideo(imageUrls, input.hook, input.story, thumbnailUrl, narrationUrl),
      { maxAttempts: 2 }
    );

    await safeUpsert([{ jobId: input.jobId, status: "done", finalVideoUrl, completedAt: new Date().toISOString() }]);

    return { finalVideoUrl, thumbnailUrl, jobId: input.jobId };
  },
});
