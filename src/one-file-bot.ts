import axios from "axios";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY;
const SHOTSTACK_ENV = process.env.SHOTSTACK_ENV || "stage";

// --- [Part 1: Action 로직] ---
async function generateshortsAction(topic: string) {
  console.log(`\n[AI] "${topic}" 주제로 고퀄리티 대본 및 시나리오 기획 중...`);
  let content;
  try {
    const prompt = `YouTube Shorts 콘텐츠를 주제 "${topic}"로 기획해줘. JSON 형식으로: { 
      "hook": "관심을 끄는 1줄", 
      "story": ["6개 장면의 짧은 한국어 대본"], 
      "imageKeywords": ["각 장면에 어울리는 짧은 영어 검색어 6개 (예: puppy, golden retriever, garden)"]
    }`;
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );
    const text = response.data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
    content = JSON.parse(text);
  } catch (e) {
    console.log("Gemini 호출 오류, 기본 데이터를 사용합니다.");
    content = {
      hook: `[AI] "${topic}"의 놀라운 사실!`,
      story: ["신비로운 첫 번째 장면입니다.", "두 번째 반전이 숨어있죠.", "세 번째가 궁금하시다면?", "네 번째, 이건 몰랐을걸요?", "다섯 번째의 결말입니다.", "마지막까지 시청해주셔서 감사합니다!"],
      imageKeywords: ["nature", "travel", "mystery", "cool", "epic", "finish"]
    };
  }

  console.log(`[Video] 나레이션과 고화질 스톡 이미지를 결합하여 렌더링 중...`);
  
  // Shotstack 타임라인 구성 (목소리 + 배경 + 자막)
  const tracks = [
    // Track 1: 한국어 자막 (HTML)
    {
      clips: content.story.map((text: string, i: number) => ({
        asset: {
          type: "html",
          html: `<p style="color: #ffffff; font-size: 34px; text-align: center; background: rgba(0,0,0,0.5); padding: 25px; border-radius: 12px;">${text}</p>`,
          css: "p { font-family: 'NanumGothic'; font-weight: bold; width: 800px; }",
          width: 900, height: 500
        },
        start: i * 4, length: 4, position: "center"
      }))
    },
    // Track 2: 배경 이미지 (Stock Photos)
    {
      clips: content.imageKeywords.map((keyword: string, i: number) => ({
        asset: {
          type: "image",
          src: `https://templates.shotstack.io/basic/asset/image/stock/${keyword}.jpg` // Shotstack의 기본 스톡 경로 예시
        },
        start: i * 4, length: 4, effect: "zoomIn"
      }))
    },
    // Track 3: 나레이션 (Shotstack TTS)
    {
      clips: content.story.map((text: string, i: number) => ({
        asset: {
          type: "tts",
          text: text,
          voice: "Joanna"
        },
        start: i * 4, length: 4
      }))
    }
  ];

  try {
    const renderResp = await axios.post(
      `https://api.shotstack.io/${SHOTSTACK_ENV}/render`,
      {
        timeline: { background: "#000000", fonts: [{ src: "https://github.com/google/fonts/raw/main/ofl/nanumgothic/NanumGothic-Bold.ttf" }], tracks },
        output: { format: "mp4", resolution: "hd" }
      },
      { headers: { "x-api-key": SHOTSTACK_API_KEY } }
    );
    const renderId = renderResp.data.response.id;
    console.log(`[Video] 렌더링 시작! (ID: ${renderId})`);
    
    // 렌더링 완료까지 폴링 (Polling)
    let videoUrl = "";
    while (true) {
      console.log("[Video] 제작 중... (10초 대기)");
      await new Promise(resolve => setTimeout(resolve, 10000));
      const statusResp = await axios.get(
        `https://api.shotstack.io/${SHOTSTACK_ENV}/render/${renderId}`,
        { headers: { "x-api-key": SHOTSTACK_API_KEY } }
      );
      const status = statusResp.data.response.status;
      if (status === "done") {
        videoUrl = statusResp.data.response.url;
        break;
      } else if (status === "failed") {
        throw new Error("Shotstack 렌더링 실패");
      }
    }
    return { ...content, videoUrl };
  } catch (e) {
    console.error("Shotstack Error:", e);
    return { ...content, videoUrl: "" };
  }
}

// --- [Part 2: 에뮬레이터 인터페이스] ---
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function run() {
  console.log("\n========================================");
  console.log("   🚀 AI 숏츠 제작 봇 (통합형) 가동   ");
  console.log("========================================\n");
  
  rl.question("주제를 입력하세요 (예: 고양이, 우주여행): ", async (topic) => {
    console.log(`\n🤖 봇: "${topic}" 주제로 AI 영상을 제작 중입니다... 🎬`);
    
    const result = await generateshortsAction(topic);
    
    if (result.videoUrl) {
      console.log(`\n✨ 제작 완료! 링크를 확인하세요:\n${result.videoUrl}`);
    } else {
      console.log("\n⚠️ 영상 제작에 실패했습니다.");
    }

    console.log("\n========================================\n");
    rl.close();
  });
}

run().catch(console.error);
