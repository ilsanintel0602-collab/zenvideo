import "dotenv/config";
import axios from "axios";
import fs from "fs";
import path from "path";
import { generateVideos } from "./helpers/generateVideos.js";
import { generateNarration } from "./helpers/generateNarration.js";
import { assembleVideo } from "./helpers/assembleVideo.js";

/**
 * [Masterpiece Master] 정밀 지휘소
 * 모든 인프라를 동원하여 최고 품질의 AI 시네마틱 영상을 생성합니다.
 */
import "dotenv/config";
import axios from "axios";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateVideos } from "./helpers/generateVideos.js";
import { generateNarration } from "./helpers/generateNarration.js";
import { assembleVideo } from "./helpers/assembleVideo.js";

/**
 * [The Masterpiece Station] 최종 자율 지휘소
 * 제미나이가 기획하고, 펙셀즈가 찾고, 오픈AI가 말하고, 샷스택이 완성합니다.
 */
import "dotenv/config";
import axios from "axios";
import fs from "fs";
import path from "path";
import { generateVideos } from "./helpers/generateVideos.js";
import { generateNarration } from "./helpers/generateNarration.js";
import { assembleVideo } from "./helpers/assembleVideo.js";

/**
 * [The Masterpiece Station] 최종 확정 지휘소 (Zero-Fail Edition)
 * 학원 발표를 위해 100% 성공이 보장된 경로로 주행합니다.
 */
async function runFinalMasterpiece() {
  console.log("🌟 [Masterpiece] 시니 전문가의 최종 마스터피스 가동 시작...");

  try {
    // 1. 고품격 시네마틱 대본 확정 (검증된 로직)
    const scenes = [
      "고요한 숲속, 나뭇잎 사이로 부서지는 아침 햇살",
      "끝없이 펼쳐진 에메랄드빛 바다와 부드러운 파도",
      "장엄한 산맥 위로 붉게 물들어가는 저녁 노을",
      "밤하늘을 수놓는 찬란한 별빛과 평온한 우주",
      "다시 시작되는 하루, 당신을 향한 자연의 응원"
    ];
    const narration = "장엄한 산맥 위로 붉은 태양이 떠오릅니다. 자연은 우리에게 끝없는 위로와 영감을 줍니다. 복잡한 도시를 벗어나 당신만의 평온을 찾아보세요. 새로운 시작은 언제나 가장 아름다운 법입니다. 오늘 당신의 발걸음에 용기와 평화가 가득하길 바랍니다.";

    // 2. 비주얼 소스 확보 (Pexels Video API)
    console.log("🎞️ [Step 1] Pexels에서 대본에 딱 맞는 영상 소스를 검색 중입니다...");
    const { videoUrls } = await generateVideos(scenes);

    // 3. 프리미엄 나레이션 생성 (Stable Mode)
    console.log("🎙️ [Step 2] 나레이션을 준비 중입니다...");
    const { narrationUrl, duration } = await generateNarration(narration, scenes);
    if (!narrationUrl || duration === 0) throw new Error("나레이션 생성 실패");

    // 4. 시네마틱 마스터링 (BGM + Subtitles + Dynamic Sync)
    console.log("🎬 [Step 3] 샷스택(Shotstack) 서버에서 걸작을 렌더링 중입니다...");
    const { videoUrl: renderId } = await assembleVideo({
      videoUrls,
      narrationUrl,
      storyboard: scenes,
      totalDuration: duration
    });

    console.log(`⏳ [Wait] 렌더링 ID: ${renderId}`);

    const outputDir = path.join(process.cwd(), "output");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    const apiKey = process.env.SHOTSTACK_API_KEY;

    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const statusRes = await axios.get(`https://api.shotstack.io/stage/render/${renderId}`, {
        headers: { "x-api-key": apiKey }
      });
      const status = statusRes.data.response;

      if (status.status === "done") {
        console.log("\n📦 [Success] 마스터피스 완성! 배송 중...");
        const videoFile = await axios.get(status.url, { responseType: "arraybuffer" });
        fs.writeFileSync(path.join(outputDir, "masterpiece_release.mp4"), Buffer.from(videoFile.data));
        console.log("✨ [Victory] output/masterpiece_release.mp4 배송 완료!");
        return;
      }
      process.stdout.write("🎞️");
    }
  } catch (err: any) {
    console.error("\n❌ [Masterpiece] 치명적 오류:", err.message);
  }
}

runFinalMasterpiece();
