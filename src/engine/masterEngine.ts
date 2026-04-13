import "dotenv/config";
import axios from "axios";
import { generateVideos } from "../helpers/generateVideos.js";
import { generateNarration } from "../helpers/generateNarration.js";
import { assembleVideo } from "../helpers/assembleVideo.js";

export interface MasterpieceResult {
  success: boolean;
  videoUrl?: string;
  renderId?: string;
  error?: string;
  status: string;
}

// Gemini 폴백 모델 우선순위 목록
const GEMINI_MODELS = [
  "gemini-flash-latest",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-pro-latest",
];

// 재시도 유틸 (503 과부하 대응)
async function callGeminiWithRetry(apiKey: string, prompt: string): Promise<string> {
  for (const model of GEMINI_MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🧠 [Gemini] 모델: ${model} (시도 ${attempt}/3)`);
        const res = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          { contents: [{ parts: [{ text: prompt }] }] },
          { headers: { "Content-Type": "application/json" }, timeout: 30000 }
        );
        const text = res.data.candidates[0].content.parts[0].text.trim();
        console.log(`✅ [Gemini] ${model} 응답 성공`);
        return text;
      } catch (err: any) {
        const code = err.response?.data?.error?.code;
        const msg = err.response?.data?.error?.message || err.message;
        console.warn(`⚠️ [Gemini] ${model} 시도 ${attempt} 실패 (${code}): ${msg}`);
        // 503 과부하 → 2초 대기 후 재시도
        if (code === 503 && attempt < 3) {
          await new Promise(r => setTimeout(r, 2000 * attempt));
          continue;
        }
        // 404/403 → 이 모델은 사용 불가, 다음 모델로
        break;
      }
    }
  }
  throw new Error("모든 Gemini 모델 호출에 실패했습니다. 잠시 후 다시 시도해주세요.");
}

/**
 * ZenVideo Master Engine — Resilient Edition
 * 자동 재시도 + 폴백 모델로 안정적인 영상 생성을 보장합니다.
 */
/**
 * 씬 수를 줄여 클립당 30초 확보 → 시네마틱하고 안정적인 화면 유지
 * 단어 수 = (목표분 × 220wpm) / 씬수
 */
const DURATION_CONFIG: Record<number, { scenes: number; wordsPerScene: number; label: string }> = {
  1:  { scenes: 3,  wordsPerScene: 73,  label: "1분" },
  3:  { scenes: 6,  wordsPerScene: 110, label: "3분" },
  5:  { scenes: 10, wordsPerScene: 110, label: "5분" },
  10: { scenes: 15, wordsPerScene: 147, label: "10분" },
};

export class MasterEngine {
  static async create(topic: string, minutes: number = 3): Promise<MasterpieceResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    const config = DURATION_CONFIG[minutes] ?? DURATION_CONFIG[3];
    console.log(`🚀 [MasterEngine] Starting production: "${topic}" (${config.label})`);

    try {
      // 1. AI Planning: 재시도 + 폴백 모델 적용
      console.log("🧠 [MasterEngine] AI 스토리보드 기획 시작...");

      /**
       * 핵심 전략:
       * - "visual" = Pexels에서 확실히 찾을 수 있는 시각 테마 (나라+분위기+장면 유형)
       * - "narration" = 실제 장소를 감성적으로 설명 (영상과 1:1 매칭 불필요)
       * - "location" = 자막으로 보여줄 구체적 장소명
       * → 다큐처럼 아름다운 B-roll이 흐르는 동안 나레이션이 장소를 설명
       */
      const prompt = `Create a ${config.scenes}-scene video storyboard for the topic: "${topic}".

      Respond ONLY with valid JSON:
      { "scenes": [{"visual": "...", "fallback": "...", "location": "...", "narration": "..."}, ...] }

      Field rules:

      "visual" — English Pexels search term for beautiful B-roll footage.
        Think: what VISUAL CATEGORY does this scene belong to?
        Use COUNTRY/REGION + VISUAL TYPE + optional mood word.
        Examples: "Japan misty mountain forest", "Japan wooden temple pathway",
                  "Japan rural snow village", "Japan autumn river valley",
                  "Korea traditional hanok courtyard", "Italy coastal cliffs sunset"
        NEVER use specific place names that only locals know.
        NEVER use names of small cities or regional landmarks.

      "fallback" — even simpler version if visual fails.
        Must keep the COUNTRY/REGION. e.g. "Japan scenic nature", "Japan mountain".
        2-3 words only.

      "location" — specific Korean place name for the subtitle shown on screen.
        e.g. "도야마 성", "구로베 협곡", "고카야마 마을". Max 12 Korean characters.

      "narration" — Korean text of exactly ~${config.wordsPerScene} Korean words.
        Write about the specific location emotionally and immersively.
        The narration describes the real place; the video shows its visual atmosphere.

      - Exactly ${config.scenes} scenes covering the full story of "${topic}"
      - All narrations together = a complete, engaging ${config.label} video script
      - Language: Korean for narration and location only`;

      const rawText = await callGeminiWithRetry(apiKey!, prompt);
      console.log("🤖 [AI Response] Raw Content Received.");

      // 2. JSON 안전 파싱
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("AI 응답에서 유효한 기획 데이터를 찾을 수 없습니다.");

      const plan = JSON.parse(jsonMatch[0]);
      console.log("✅ [MasterEngine] 기획 완료 (씬 수:", plan.scenes.length, ")");

      // 장면별 나레이션을 합쳐서 전체 나레이션 구성
      const fullNarration = plan.scenes
        .map((s: any) => (typeof s === "string" ? "" : s.narration ?? ""))
        .filter(Boolean)
        .join(" ");

      console.log(`📝 [MasterEngine] 전체 나레이션 구성 완료 (총 ${fullNarration.split(" ").length} 단어)`);

      // visual(새 필드명) 또는 primary(이전 호환) 모두 처리
      const sceneQueries: { primary: string; fallback: string }[] = plan.scenes.map((s: any) => {
        if (typeof s === "string") return { primary: s, fallback: s };
        const visual = s.visual ?? s.primary ?? s.fallback ?? "scenic travel";
        const fallback = s.fallback ?? visual;
        return { primary: visual, fallback };
      });

      // 장면별 자막 (location) 추출
      const locations: string[] = plan.scenes.map((s: any) =>
        typeof s === "string" ? "" : (s.location ?? "")
      );

      // 3. 영상 소스 수집 (Pexels)
      console.log("🎞️ [MasterEngine] 시각 에이전트: 영상 소스 수집 중...");
      const { videoAssets } = await generateVideos(sceneQueries);
      console.log(`✅ [MasterEngine] 영상 소스 확보 완료 (총 ${videoAssets.length}개).`);

      // 4. 나레이션 생성 (OpenAI TTS)
      console.log("🎙️ [MasterEngine] 음성 에이전트: 나레이션 합성 중...");
      const { narrationUrl } = await generateNarration(fullNarration, plan.scenes);
      if (narrationUrl) {
        console.log("✅ [MasterEngine] 나레이션 합성 및 배송 완료.");
      } else {
        console.warn("⚠️ [MasterEngine] 나레이션 업로드 실패 — 영상만으로 진행합니다.");
      }

      // 선택한 분수를 정확한 초 단위로 사용 (파일 크기 기반 추정 사용 안 함)
      const totalDuration = minutes * 60;
      console.log(`⏱️ [MasterEngine] 목표 상영 시간: ${totalDuration}초 (${config.label})`);

      // 5. 최종 영상 조립 (Shotstack)
      console.log("🎬 [MasterEngine] 제작 에이전트: 최종 영상 조립 시작...");
      const assemblyResult = await assembleVideo({
        videoAssets,
        narrationUrl,
        locations,
        totalDuration
      });

      console.log("🚀 [MasterEngine] 대성공! 렌더링 ID:", assemblyResult.videoUrl);
      return {
        success: true,
        status: "processing",
        renderId: assemblyResult.videoUrl
      };

    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      console.error("❌ [MasterEngine] Production Error:", errorMsg);
      return {
        success: false,
        status: "failed",
        error: errorMsg
      };
    }
  }
}
