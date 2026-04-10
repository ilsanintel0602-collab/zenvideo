import axios from "axios";
import dotenv from "dotenv";
dotenv.config({ override: true });

const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY;

async function testStatic() {
  console.log("🚀 [Static Test] 제미나이를 생략하고 고화질 영상 제작 엔진만 가동합니다...");

  const content = {
    hook: "세상에서 가장 귀여운 강아지 TOP 3!",
    story: [
      "첫 번째는 복실복실한 골든 리트리버입니다.",
      "너무 사랑스럽지 않나요?",
      "두 번째는 작고 귀여운 포메라니안!",
      "구름처럼 몽글몽글한 털이 매력적이에요.",
      "마지막은 장난꾸러기 비글입니다.",
      "오늘도 강아지와 행복한 하루 되세요!"
    ],
    imageKeywords: ["golden retriever", "puppy", "pomeranian", "white dog", "beagle", "happy dog"]
  };

  const tracks = [
    {
      clips: content.story.map((text, i) => ({
        asset: {
          type: "html",
          html: `<p style="color:white;font-size:34px;text-align:center;">${text}</p>`,
          css: "p { font-family: 'NanumGothic'; font-weight: bold; }",
          width: 800, height: 200
        },
        start: i * 4, length: 4, position: "center"
      }))
    },
    {
      clips: content.imageKeywords.map((keyword, i) => ({
        asset: {
          type: "image",
          src: `https://templates.shotstack.io/basic/asset/image/stock/${keyword}.jpg`
        },
        start: i * 4, length: 4, effect: "zoomIn"
      }))
    },
    {
      clips: content.story.map((text, i) => ({
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
    const res = await axios.post(
      "https://api.shotstack.io/stage/render",
      {
        timeline: { background: "#000000", fonts: [{ src: "https://github.com/google/fonts/raw/main/ofl/nanumgothic/NanumGothic-Bold.ttf" }], tracks },
        output: { format: "mp4", resolution: "hd" }
      },
      { headers: { "x-api-key": SHOTSTACK_API_KEY } }
    );

    const renderId = res.data.response.id;
    console.log("🎬 렌더링 시작! (ID:", renderId, ")");

    while (true) {
      process.stdout.write(".");
      await new Promise(r => setTimeout(r, 5000));
      const statusRes = await axios.get(`https://api.shotstack.io/stage/render/${renderId}`, { headers: { "x-api-key": SHOTSTACK_API_KEY } });
      if (statusRes.data.response.status === "done") {
        console.log("\n✨ [성공] 영상 주소:\n", statusRes.data.response.url);
        break;
      }
    }
  } catch (e: any) {
    console.error("❌ 에러:", e.response?.status, JSON.stringify(e.response?.data, null, 2));
  }
}

testStatic();
