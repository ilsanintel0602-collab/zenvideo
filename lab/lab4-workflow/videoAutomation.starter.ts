/**
 * Lab 4: Workflow 오케스트레이션 (starter)
 *
 * 이미지 생성 → 나레이션 생성 → 영상 조립의 3단계 파이프라인입니다.
 * TODO를 완성 후 src/workflows/videoAutomation.ts에 복사하세요.
 */

import { Workflow, z } from "@botpress/runtime";
// TODO 1: 아래 imports의 경로를 완성하세요 (src/에 있는 파일 기준)
import videoJobs from "../tables/videoJobs";
import { generateImages } from "../helpers/generateImages";
import { generateNarration } from "../helpers/generateNarration";
import { assembleVideo } from "../helpers/assembleVideo";

export default new Workflow({
  name: "videoAutomation",
  description: "YouTube Shorts pipeline: topic content plan → images → narration → video",

  // TODO 2: 타임아웃을 설정하세요 (이미지 7개 + TTS + Shotstack 렌더링 = 최대 10분)
  timeout: /* TODO: "??m" */,

  // 입력 스키마 — Conversation에서 전달하는 데이터
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

  // 출력 스키마 — workflow_callback으로 Conversation에 전달되는 데이터
  output: z.object({
    finalVideoUrl: z.string(),
    thumbnailUrl:  z.string(),
    jobId:         z.string(),
  }),

  handler: async ({ input, step }) => {
    // Table 업데이트 실패가 워크플로우를 중단하지 않도록 try/catch로 감쌉니다
    const safeUpsert = async (rows: any[]) => {
      try {
        await videoJobs.upsertRows({ rows, keyColumn: "jobId" });
      } catch (_) {}
    };

    await safeUpsert([{ jobId: input.jobId, status: "processing" }]);

    // ── Step 1: 이미지 생성 ──────────────────────────────────────────────────
    // TODO 3: step()을 사용하여 이미지 생성 단계를 구현하세요
    // 단계 이름: "generate-images"
    // 실행 함수: generateImages(input.imagePrompts, input.thumbnailPrompt)
    // maxAttempts: 2
    const { imageUrls, thumbnailUrl } = await step(
      /* TODO: 단계 이름 */,
      /* TODO: 실행 함수 */,
      /* TODO: 옵션 */
    );

    await safeUpsert([{
      jobId: input.jobId,
      imageUrlsJson: JSON.stringify([...imageUrls, thumbnailUrl]),
      thumbnailUrl,
    }]);

    // ── Step 2: 나레이션 생성 ────────────────────────────────────────────────
    // TODO 4: step()을 사용하여 나레이션 생성 단계를 구현하세요
    // 단계 이름: "generate-narration"
    // 실행 함수: generateNarration(input.hook, input.story)
    // maxAttempts: 2
    const { narrationUrl } = await step(
      /* TODO */
    );

    // ── Step 3: 영상 조립 ────────────────────────────────────────────────────
    // TODO 5: step()을 사용하여 영상 조립 단계를 구현하세요
    // 단계 이름: "assemble-video"
    // 실행 함수: assembleVideo(imageUrls, input.hook, input.story, thumbnailUrl, narrationUrl)
    // maxAttempts: 2
    const { finalVideoUrl } = await step(
      /* TODO */
    );

    // TODO 6: 완료 상태로 Table을 업데이트하세요
    await safeUpsert([{
      jobId: input.jobId,
      status: /* TODO */,
      finalVideoUrl,
      completedAt: new Date().toISOString(),
    }]);

    // TODO 7: 출력 스키마에 맞게 반환하세요
    return {
      finalVideoUrl,
      thumbnailUrl,
      jobId: input.jobId,
    };
  },
});
