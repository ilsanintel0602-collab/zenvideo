import "dotenv/config";
import axios from "axios";
import fs from "fs";
import path from "path";
import { generateNarration } from "./helpers/generateNarration.js";

/**
 * [Fixed Academy Release] 마스터 엔진
 * 하드코딩된 오류를 제거하고, 외부의 안정적인 헬퍼를 호출하도록 정밀 교정된 버전입니다.
 */
async function fixedAcademyRelease() {
  console.log("🚀 [Expert] 학원 발표용 최종 프리미엄 쇼츠 생성을 시작합니다...");

  const apiKey = process.env.SHOTSTACK_API_KEY;

  const storyboard = [
    "장엄한 산맥 위로 붉은 태양이 떠오릅니다.",
    "자연은 우리에게 끝없는 위로와 영감을 줍니다.",
    "복잡한 도시를 벗어나 당신만의 평온을 찾아보세요.",
    "새로운 시작은 언제나 가장 아름다운 법입니다.",
    "오늘 당신의 발걸음에 용기와 평화가 가득하길."
  ];
  const fullText = storyboard.join(" ");

  try {
    // 2. 나레이션 생성 (이제 안정적인 헬퍼를 호출합니다)
    const { narrationUrl } = await generateNarration(fullText, storyboard);
    if (!narrationUrl) throw new Error("나레이션 생성에 실패했습니다.");

    // 3. 비디오 조립 (Shotstack Premium Stock + NanumGothic)
    const stockVisuals = [
      "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/images/mountains.jpg",
      "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/images/ocean.jpg",
      "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/images/forest.jpg",
      "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/images/sunset.jpg",
      "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/images/night-sky.jpg"
    ];

    const timeline = {
      fonts: [{ src: "https://github.com/google/fonts/raw/main/ofl/nanumgothic/NanumGothic-Regular.ttf" }],
      background: "#000000",
      tracks: [
        {
          clips: storyboard.map((text, i) => ({
            asset: {
              type: "html",
              html: `<p data-alignment="center" style="font-family: 'NanumGothic'; font-size: 32px; color: #ffffff; text-align: center;">${text}</p>`,
              css: "p { font-weight: bold; text-shadow: 2px 2px 6px rgba(0,0,0,0.8); padding-top: 400px; }",
              width: 800, height: 600
            },
            start: i * 5, length: 5, transition: { entry: "fade", exit: "fade" }
          }))
        },
        {
          clips: stockVisuals.map((url, i) => ({
            asset: { type: "image", src: url },
            start: i * 5, length: 5, transition: { entry: "fade", exit: "fade" }
          }))
        },
        {
          clips: [{ asset: { type: "audio", src: narrationUrl }, start: 0, length: storyboard.length * 5 }]
        }
      ]
    };

    const renderRes = await axios.post(
      "https://api.shotstack.io/stage/render",
      { timeline, output: { format: "mp4", resolution: "sd" } },
      { headers: { "x-api-key": apiKey, "Content-Type": "application/json" } }
    );
    const renderId = renderRes.data.response.id;
    console.log(`⏳ [Expert] 렌더링 중 (ID: ${renderId})`);

    const outputDir = path.join(process.cwd(), "output");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const statusRes = await axios.get(`https://api.shotstack.io/stage/render/${renderId}`, { headers: { "x-api-key": apiKey } });
      const status = statusRes.data.response;
      if (status.status === "done") {
        const videoRes = await axios.get(status.url, { responseType: "arraybuffer" });
        fs.writeFileSync(path.join(outputDir, "academy_release.mp4"), Buffer.from(videoRes.data));
        console.log("📦 [Success] output/academy_release.mp4 배송 완료!");
        return;
      }
      process.stdout.write(".");
    }
  } catch (e: any) {
    console.error("❌ [Expert] 치명적 오류:", e.response?.data || e.message);
  }
}

fixedAcademyRelease();
