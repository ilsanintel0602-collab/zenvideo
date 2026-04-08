/**
 * generateshorts Action — Lab 2에서 구현합니다.
 *
 * 주제를 입력받아 YouTube Shorts 콘텐츠 기획을 생성합니다.
 * lab/lab2-action/starter.ts 를 참고하여 구현하세요.
 */

import { Action, adk, z } from "@botpress/runtime";

export default new Action({
    name: "generateshorts",
    input: z.object({
        topic: z.string(),
    }),
    output: z.object({
        hook: z.string(),
        story: z.array(z.string()).length(6),
        imagePrompts: z.array(z.string()).length(6),
        videoPrompts: z.array(z.string()).length(6),
        thumbnailPrompt: z.string(),
    }),
    handler: async ({ input }) => {
        // TODO Lab 2: adk.zai.extract()로 LLM 콘텐츠 기획 생성
        // lab/lab2-action/starter.ts 참고

        // 임시 더미 반환 (Lab 2 완성 전까지 에러 방지)
        return {
            hook: `[Lab 2를 완성하세요] 주제: ${input.topic}`,
            story: ["장면1", "장면2", "장면3", "장면4", "장면5", "장면6"],
            imagePrompts: ["img1", "img2", "img3", "img4", "img5", "img6"],
            videoPrompts: ["vid1", "vid2", "vid3", "vid4", "vid5", "vid6"],
            thumbnailPrompt: "thumbnail",
        };
    },
});
