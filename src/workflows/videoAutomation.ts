/**
 * videoAutomation Workflow — 영상 제작 자동화 지휘소
 * 
 * 기획 → 소스 확보 → 나레이션 합성 → 최종 렌더링을 오케스트레이션합니다.
 */
import { Workflow, z } from "@botpress/runtime";
import videoJobs from "../tables/videoJobs.js";
import { generateImages } from "../helpers/generateImages.js";
import { generateNarration } from "../helpers/generateNarration.js";
import { assembleVideo } from "../helpers/assembleVideo.js";

export default new Workflow({
  name: "videoAutomation",
  description: "YouTube Shorts pipeline: topic → images → narration → video",
  input: z.object({
    jobId: z.string(),
    topic: z.string(),
    conversationId: z.string(),
    hook: z.string(),
    story: z.array(z.string()).length(6),
    imagePrompts: z.array(z.string()).length(6),
    videoPrompts: z.array(z.string()).length(6),
    thumbnailPrompt: z.string(),
  }),
  output: z.object({
    finalVideoUrl: z.string(),
    thumbnailUrl: z.string(),
    jobId: z.string(),
  }),

  handler: async ({ input, step }) => {
    // 로컬과 서버 환경 모두에서 죽지 않는 안전 업데이트 함수
    const safeUpsert = async (rows: any[]) => {
      try {
        if (videoJobs && typeof (videoJobs as any).upsertRows === "function") {
          await (videoJobs as any).upsertRows({ rows, keyColumn: "jobId" });
        }
      } catch (e: any) {
        console.warn("⚠️ [Table Skip] 로컬 환경이거나 테이블이 준비되지 않았습니다.");
      }
    };

    console.log(`🚀 [Workflow] '${input.topic}' 숏츠 제작을 시작합니다!`);
    await safeUpsert([{ jobId: input.jobId, status: "planning", topic: input.topic }]);

    // 1. 고화질 이미지 소스 준비 (Step 1)
    const { assets, thumbnailUrl } = await step(
      "generate-visuals",
      async () => {
        await safeUpsert([{ jobId: input.jobId, status: "generating_visuals" }]);
        return generateImages(input.imagePrompts, input.thumbnailPrompt);
      },
      { maxAttempts: 2 }
    );

    // 2. 한국어 무료 나레이션 생성 (Step 2)
    const { narrationUrl } = await step(
      "generate-voice",
      async () => {
        await safeUpsert([{ jobId: input.jobId, status: "generating_voice" }]);
        return generateNarration(input.hook, input.story);
      },
      { maxAttempts: 2 }
    );

    // 3. 최종 고품질 영상 조립 (Step 3)
    const { videoUrl: finalVideoUrl } = await step(
      "assemble-cinematic",
      async () => {
        await safeUpsert([{ jobId: input.jobId, status: "rendering" }]);
        return assembleVideo({
          videoAssets: assets,
          narrationUrl,
          storyboard: input.story,
          totalDuration: 30 // 워크플로우 대략적인 영상 길이 (초)
        });
      },
      { maxAttempts: 2 }
    );


    // 최종 완료 업데이트 (Lab 5 기능)
    await safeUpsert([
      {
        jobId: input.jobId,
        status: "done",
        finalVideoUrl: finalVideoUrl,
        completedAt: new Date().toISOString()
      }
    ]);

    console.log("✨ [Workflow] 모든 시네마틱 제작 공정이 완료되었습니다!");
    return { finalVideoUrl, thumbnailUrl, jobId: input.jobId };
  },
});
