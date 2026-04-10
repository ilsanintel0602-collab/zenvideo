import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY || "";
const SHOTSTACK_ENV = process.env.SHOTSTACK_ENV || "stage";

if (!GEMINI_API_KEY || !SHOTSTACK_API_KEY) {
  console.error("❌ GEMINI_API_KEY 또는 SHOTSTACK_API_KEY가 설정되지 않았습니다.");
  process.exit(1);
}

async function main() {
  const topic = "AI가 바꾸는 우리의 미래";
  console.log(`\n🚀 주제 "${topic}"로 영상을 제작합니다...`);

  // 1. 대본 기획 (하드코딩 - 쿼터 이슈 우회)
  console.log("📝 1. 대본 기획 완료...");
  const content = {
    hook: "AI가 바꾸는 우리의 미래, 이미 시작되었습니다.",
    story: [
      "매일 아침, 스마트 미러가 당신의 건강을 체크합니다.",
      "출근길 자율주행 차 안에서 당신은 휴식을 취하죠.",
      "회의 중에 AI가 실시간으로 통역을 도와줍니다.",
      "집에 돌아오면 스마트 홈이 최적의 환경을 맞춰둡니다.",
      "AI는 단순한 도구가 아니라, 당신의 파트너입니다.",
      "상상 속의 미래, 지금 당신 곁에 있습니다."
    ],
    imagePrompts: [
      "futuristic smart mirror displaying health data, cinematic style",
      "relaxing inside a futuristic self-driving car, sunset city view through windows",
      "ai holographic assistant during a business meeting, professional lighting",
      "smart home interior automatically adjusting lights and temperature, cozy mood",
      "human and ai robot shaking hands, futuristic cybercity background",
      "futuristic city landscape with high speed trains and greenery, bright morning"
    ]
  };

  try {
    // 2. 이미지 생성 (임시로 랜덤 이미지 사용 - 쿼터 절약)
    console.log("🎨 2. 이미지 준비 중...");
    const imageUrls: string[] = [];
    for (let i = 0; i < 6; i++) {
      imageUrls.push(`https://picsum.photos/seed/${Math.random()}/1080/1920`);
    }

    // 3. Shotstack 영상 조립
    console.log("🎬 3. 영상 조립 중 (Shotstack)...");
    const shotstackResponse = await axios.post(
      `https://api.shotstack.io/${SHOTSTACK_ENV}/render`,
      {
        timeline: {
          background: "#000000",
          fonts: [
            {
              src: "https://github.com/google/fonts/raw/main/ofl/nanumgothic/NanumGothic-Bold.ttf"
            }
          ],
          tracks: [
            {
              clips: content.story.map((text, i) => ({
                asset: {
                  type: "html",
                  html: `<p style="color: #ffffff; font-size: 32px; text-align: center; background: rgba(0,0,0,0.7); padding: 25px; line-height: 1.4;">${text}</p>`,
                  css: "p { font-family: 'NanumGothic'; font-weight: bold; border-radius: 12px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }",
                  width: 900,
                  height: 450
                },
                start: i * 3,
                length: 3,
                position: "center"
              }))
            },
            {
              clips: imageUrls.map((url, i) => ({
                asset: {
                  type: "image",
                  src: url
                },
                start: i * 3,
                length: 3,
                effect: "zoomIn"
              }))
            }
          ]
        },
        output: { format: "mp4", resolution: "hd" }
      },
      { headers: { "x-api-key": SHOTSTACK_API_KEY, "Content-Type": "application/json" } }
    );

    const renderId = shotstackResponse.data.response.id;
    console.log(`✅ 렌더링 시작! (ID: ${renderId})`);
    
    let status = "queued";
    let videoUrl = "";
    process.stdout.write("⏳ 영상 제작 진행 중: ");
    
    while (status !== "done" && status !== "failed") {
      await new Promise(r => setTimeout(r, 5000));
      const statusRes = await axios.get(`https://api.shotstack.io/${SHOTSTACK_ENV}/render/${renderId}`, {
        headers: { "x-api-key": SHOTSTACK_API_KEY }
      });
      status = statusRes.data.response.status;
      videoUrl = statusRes.data.response.url;
      process.stdout.write(".");
    }

    if (status === "done") {
      console.log("\n\n🎉 드디어 성공했습니다!");
      console.log(`🔗 영상 주소: ${videoUrl}`);
    } else {
      console.log("\n❌ 영상 제작 실패 (서버 에러)");
    }
  } catch (error: any) {
    console.error("❌ 에러 발생:", error.response?.data || error.message);
  }
}

main().catch(console.error);
