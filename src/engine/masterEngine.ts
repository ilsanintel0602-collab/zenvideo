import "dotenv/config";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateVideos } from "../helpers/generateVideos.js";
import { generateNarration } from "../helpers/generateNarration.js";
import { assembleVideo } from "../helpers/assembleVideo.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface MasterpieceResult {
  success: boolean;
  videoUrl?: string; // Original URL
  renderId?: string; // New tracking ID for Shotstack/Gateway
  error?: string;
  status: string;
}

/**
 * ZenVideo Master Engine
 * The intelligent core that orchestrates the entire AI video pipeline.
 */
export class MasterEngine {
  /**
   * Generates a complete cinematic video from a single topic.
   */
  static async create(topic: string): Promise<MasterpieceResult> {
    console.log(`🚀 [MasterEngine] Starting production for topic: "${topic}"`);

    try {
      // 1. AI Planning: Generate Storyboard & Script via Gemini
      console.log("🧠 [MasterEngine] Planning storyboard with AI...");
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Create a cinematic 5-scene storyboard and a continuous spoken narration for a video titled "${topic}". 
      Respond ONLY with a JSON object in this format: 
      { "scenes": ["visual description 1", "visual description 2", ...], "narration": "full spoken script" }
      The narration should be about 30-40 seconds long. Language: Korean. Descriptions: Professional & Descriptive.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const rawText = response.text().trim();
      console.log("🤖 [AI Response] Raw Content Received:", rawText.substring(0, 100), "...");
      
      // 2. Extract JSON safely using a more robust Regex strategy
      let jsonStr = rawText;
      
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      } else {
        throw new Error("AI 응답에서 유효한 기획 데이터를 찾을 수 없습니다.");
      }

      const plan = JSON.parse(jsonStr);
      console.log("✅ [MasterEngine] 기획 단계 완료 (Scene Count:", plan.scenes.length, ")");

      // 3. Visual Sourcing (Pexels)
      console.log("🎞️ [MasterEngine] 시각 에이전트: 영상 소스 수집 중...");
      const { videoAssets } = await generateVideos(plan.scenes);
      console.log(`✅ [MasterEngine] 영상 소스 확보 완료 (총 ${videoAssets.length}개).`);

      // 4. Premium Narration (OpenAI TTS)
      console.log("🎙️ [MasterEngine] 음성 에이전트: 나레이션 합성 중...");
      const { narrationUrl, duration } = await generateNarration(plan.narration, plan.scenes);
      if (!narrationUrl || duration === 0) throw new Error("나레이션 생성 및 전송에 실패했습니다.");
      console.log("✅ [MasterEngine] 나레이션 합성 및 배송 완료.");

      // 5. Final Assembly (Shotstack)
      console.log("🎬 [MasterEngine] 제작 에이전트: 최종 영상 조립을 시작합니다...");
      const assemblyResult = await assembleVideo({
        videoAssets,
        narrationUrl,
        storyboard: plan.scenes,
        totalDuration: duration
      });


      console.log("🚀 [MasterEngine] 대성공! 렌더링 ID:", assemblyResult.videoUrl);
      return {
        success: true,
        status: "processing",
        renderId: assemblyResult.videoUrl
      };

    } catch (error: any) {
      console.error("❌ [MasterEngine] Production Error:", error.message);
      return {
        success: false,
        status: "failed",
        error: error.message
      };
    }
  }
}
