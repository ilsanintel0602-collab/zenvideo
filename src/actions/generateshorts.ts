import { Action, z } from "@botpress/runtime";
import axios from "axios";
import videoAutomation from "../workflows/videoAutomation";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default new Action({
  name: "generateshorts",
  input: z.object({
    topic: z.string(),
  }),
  output: z.object({
    jobId: z.string(),
    hook: z.string(),
    story: z.array(z.string()).length(6),
    status: z.string(),
  }),
  handler: async ({ input }) => {
    console.log(`🧠 [Action] '${input.topic}' 주제로 시네마틱 기획을 시작합니다...`);

    const prompt = `YouTube Shorts 콘텐츠를 주제 "${input.topic}"로 기획해줘. JSON 형식으로 반드시 답변해: { "hook": "매력적인 오프닝 문구", "story": ["6개 장면의 짧은 한국어 대본"], "imagePrompts": ["6개의 영어 이미지 생성 프롬프트"], "videoPrompts": ["6개의 영어 영상 생성 프롬프트"], "thumbnailPrompt": "이미지 생성 프롬프트" }`;

    let contentPlan: any;
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { headers: { "x-goog-api-key": GEMINI_API_KEY } }
      );
      const text = response.data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
      contentPlan = JSON.parse(text);
    } catch (e: any) {
      console.warn("⚠️ Gemini 호출 실패, 폴백 데이터를 사용합니다.");
      contentPlan = {
        hook: `주제 "${input.topic}"에 대한 놀라운 사실!`,
        story: ["첫 번째 이야기입니다.", "두 번째 장면입니다.", "세 번째가 궁금하시죠?", "네 번째 반전입니다.", "다섯 번째의 결말입니다.", "마지막까지 시청해주세요!"],
        imagePrompts: ["nature", "innovation", "science", "future", "history", "discovery"],
        videoPrompts: ["v1", "v2", "v3", "v4", "v5", "v6"],
        thumbnailPrompt: "trending topic science"
      };
    }

    const jobId = `job_${Date.now()}`;

    // 🚀 워크플로우 시작 (백그라운드에서 영상 제작 시작)
    await videoAutomation.start({
      jobId,
      topic: input.topic,
      conversationId: "internal", // 실제 환경에서는 conversation.id 사용
      hook: contentPlan.hook,
      story: contentPlan.story,
      imagePrompts: contentPlan.imagePrompts,
      videoPrompts: contentPlan.videoPrompts,
      thumbnailPrompt: contentPlan.thumbnailPrompt,
    });

    console.log(`✅ [Action] 기획 완료 및 워크플로우 가동 (ID: ${jobId})`);

    return {
      jobId,
      hook: contentPlan.hook,
      story: contentPlan.story,
      status: "started",
    };
  },
});
