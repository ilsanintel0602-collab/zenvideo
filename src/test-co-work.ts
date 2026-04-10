import "dotenv/config";
import { generateVideos } from "./helpers/generateVideos.js";
import { generateNarration } from "./helpers/generateNarration.js";
import { assembleVideo } from "./helpers/assembleVideo.js";
import axios from "axios";

async function verifyCoWork() {
  console.log("🛠️ [System] 에이전트 협업 검증 테스트 시작...");

  try {
    // 1. 시각 에셋 확보 (텍스트 검색 + 폴백 이미지 포함)
    const prompts = ["cinematic city lifestyle", "invalid_prompt_for_fallback"];
    const { videoAssets } = await generateVideos(prompts);
    console.log("✅ 시각 에셋 확보:", JSON.stringify(videoAssets, null, 2));

    // 2. 나레이션 준비 (테스트용 짧은 문장)
    const hook = "반갑습니다. 프로젝트가 거의 완성되었습니다.";
    const story = ["첫 번째 장면입니다.", "두 번째 장면은 이미지 폴백입니다."];
    const { narrationUrl, duration } = await generateNarration(hook, story);
    console.log(`✅ 나레이션 확보: ${narrationUrl} (${duration}초)`);

    // 3. 최종 조립 요청
    console.log("🎬 최종 조립 요청 중...");
    const { videoUrl: renderId } = await assembleVideo({
      videoAssets,
      narrationUrl,
      storyboard: story,
      totalDuration: duration
    });
    console.log(`⏳ 렌더링 요청 완료! 상태를 모니터링합니다. (ID: ${renderId})`);

    // 4. 상태 폴링
    const apiKey = process.env.SHOTSTACK_API_KEY;
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const statusRes = await axios.get(`https://api.shotstack.io/stage/render/${renderId}`, {
        headers: { "x-api-key": apiKey }
      });
      const status = statusRes.data.response.status;
      console.log(`...현재 상태: ${status}`);

      if (status === "done") {
        console.log("🎉 [SUCCESS] 렌더링이 성공적으로 완료되었습니다!");
        console.log("🔗 최종 영상 주소:", statusRes.data.response.url);
        return;
      }
      if (status === "failed") {
        console.error("❌ [FAILED] 렌더링 실패 상세:", JSON.stringify(statusRes.data.response, null, 2));
        process.exit(1);
      }
    }
  } catch (error: any) {
    console.error("❌ [ERROR] 시스템 오류:", error.message);
  }
}

verifyCoWork();
