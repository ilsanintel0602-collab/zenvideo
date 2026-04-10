import "dotenv/config";
import axios from "axios";

async function auditOpenAI() {
  const apiKey = process.env.OPEN_AI_API_KEY;
  console.log("🔍 [Audit] API Key (Prefix):", apiKey?.substring(0, 10));

  try {
    const res = await axios.post(
      "https://api.openai.com/v1/audio/speech",
      {
        model: "tts-1-hd",
        input: "안녕하세요, 품질 테스트입니다.",
        voice: "alloy"
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      }
    );
    console.log("✅ [Audit] OpenAI 호출 성공!");
  } catch (e: any) {
    if (e.response) {
      const errorMsg = Buffer.from(e.response.data).toString();
      console.error("❌ [Audit] OpenAI 상세 에러:", errorMsg);
    } else {
      console.error("❌ [Audit] 에러:", e.message);
    }
  }
}

auditOpenAI();
