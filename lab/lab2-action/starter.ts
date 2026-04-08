/**
 * Lab 2: Action & LLM (starter)
 *
 * TODO를 모두 완성하면 주제 입력 → GPT가 콘텐츠 기획을 구조화해서 반환합니다.
 * 완성 후 이 파일의 내용을 src/actions/generateshorts.ts에 복사하세요.
 */

import { Action, adk, z } from "@botpress/runtime";

export default new Action({
  // TODO 1: Action 이름을 설정하세요
  name: /* TODO */ "",

  // TODO 2: 입력 스키마 — topic(주제)을 문자열로 받습니다
  input: z.object({
    /* TODO */
  }),

  // TODO 3: 출력 스키마 — 아래 구조를 Zod로 정의하세요
  // hook: 문자열 (1개)
  // story: 문자열 배열 (정확히 6개)
  // imagePrompts: 문자열 배열 (정확히 6개)
  // videoPrompts: 문자열 배열 (정확히 6개)
  // thumbnailPrompt: 문자열 (1개)
  output: z.object({
    /* TODO */
  }),

  handler: async ({ input }) => {
    // TODO 4: adk.zai.extract()로 LLM에게 구조화된 콘텐츠 기획을 요청합니다
    // 첫 번째 인자: input.topic (LLM에게 줄 입력)
    // 두 번째 인자: 위에서 정의한 output과 같은 Zod 스키마
    // 세 번째 인자: { instructions: "..." } — LLM 역할과 규칙 지시
    const result = await adk.zai.extract(
      /* TODO: 첫 번째 인자 */,
      z.object({
        /* TODO: 출력 스키마 (output과 동일) */
      }),
      {
        instructions: `
          /* TODO: LLM 지시사항
           * 힌트:
           * - YouTube Shorts 콘텐츠 전략가 역할
           * - hook, story는 한국어로
           * - imagePrompts, videoPrompts, thumbnailPrompt는 영어로
           * - Hook: 시청자의 관심을 끄는 1줄
           * - Story: 6개의 장면으로 이야기 전개
           * - Image prompts: 각 장면의 시각적 묘사
           * - Video prompts: "Create a cinematic 5-second video."로 시작
           */
        `,
      }
    );

    // TODO 5: result를 반환합니다
    /* TODO */
  },
});
