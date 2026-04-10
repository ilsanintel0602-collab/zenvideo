import "dotenv/config";
import axios from "axios";
import fs from "fs";
import path from "path";
import { generateNarration } from "./helpers/generateNarration.js";
import { generateImages } from "./helpers/generateImages.js";
import { assembleVideo } from "./helpers/assembleVideo.js";

async function cinematicMaster() {
  console.log("🚀 [Master] 시네마틱 AI 방송국 엔진 가동...");

  const storyboard = [
    "어느 평온한 아침, 자연의 숨결을 느껴보세요.",
    "우리 삶 속에서 진정한 평화는 멀리 있지 않습니다.",
    "지금 이 순간, 당신의 마음을 가다듬어 보세요.",
    "변화는 아주 작은 생각의 차이에서 시작됩니다.",
    "오늘 하루, 당신만의 특별한 이야기가 시작됩니다."
  ];
  const fullText = storyboard.join(" ");

  try {
    // 1. 나레이션 생성 (OpenAI Premium)
    const { narrationUrl } = await generateNarration(fullText, storyboard);
    
    // 2. 이미지 생성 (High-Hidelity Fallback)
    const { imageUrls } = await generateImages(storyboard, "cinematic landscape");

    // 3. 비디오 조립 (Korean Font Support)
    const { videoUrl: renderId } = await assembleVideo({ imageUrls, narrationUrl, storyboard });
    console.log(`⏳ [Master] 렌더링 시작 (ID: ${renderId})`);

    const outputDir = path.join(process.cwd(), "output");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const apiKey = process.env.SHOTSTACK_API_KEY;

    // 4. 무정차 폴링 및 자동 다운로드
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const statusRes = await axios.get(`https://api.shotstack.io/stage/render/${renderId}`, {
        headers: { "x-api-key": apiKey }
      });
      const status = statusRes.data.response;

      if (status.status === "done") {
        console.log("✅ [Master] 렌더링 완료! 로컬로 배송합니다...");
        const videoRes = await axios.get(status.url, { responseType: "arraybuffer" });
        const filePath = path.join(outputDir, "cinematic_short.mp4");
        fs.writeFileSync(filePath, Buffer.from(videoRes.data));
        console.log(`📦 [Complete] 배송 완료: ${filePath}`);
        return;
      }
      if (status.status === "failed") {
         console.error("❌ [Master] 서버 실패:", JSON.stringify(status, null, 2));
         return;
      }
      process.stdout.write(".");
    }
  } catch (e: any) {
    console.error("❌ [Master] 치명적 오류:", e.message);
  }
}

cinematicMaster();
