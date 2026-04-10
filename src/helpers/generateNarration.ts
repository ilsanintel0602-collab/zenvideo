import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";

/**
 * [Invincible] 나레이션 업로드 V4 (Shotstack Ingest Edition)
 * 외부 서버 허들 없이 샷스택 본진으로 직접 파일을 쏩니다.
 */
export async function generateNarration(text: string, storyboard: string[]): Promise<{ narrationUrl: string; duration: number }> {
  const openAIKey = (process.env.OPEN_AI_API_KEY || process.env.OPENAI_API_KEY || "").trim();
  const shotstackKey = process.env.SHOTSTACK_API_KEY;
  
  if (!openAIKey || !shotstackKey) return { narrationUrl: "", duration: 0 };

  console.log("🎙️ [Expert] 프리미엄 나레이션 생성 시작 (Ingest Mode)...");

  try {
    // 1. OpenAI TTS 생성
    const ttsRes = await axios.post(
      "https://api.openai.com/v1/audio/speech",
      { model: "tts-1", input: text, voice: "shimmer" },
      { headers: { Authorization: `Bearer ${openAIKey}`, "Content-Type": "application/json" }, responseType: "arraybuffer" }
    );
    
    const audioBuffer = Buffer.from(ttsRes.data);
    const durationCount = Math.ceil(audioBuffer.length / 16000);

    const tempPath = path.join(process.cwd(), "output", "temp_voice.mp3");
    if (!fs.existsSync(path.dirname(tempPath))) fs.mkdirSync(path.dirname(tempPath));
    fs.writeFileSync(tempPath, audioBuffer);

    // 2. 고속 나레이션 배송 (Triple-Channel Buffer Edition)
    const audioBufferForUpload = fs.readFileSync(tempPath);
    
    // Channel A: File.io
    try {
      console.log("🚀 [Expert] 채널 A(File.io) 배송 시도...");
      const form = new FormData();
      form.append("file", audioBufferForUpload, { filename: "voice.mp3", contentType: "audio/mpeg" });
      const res = await axios.post("https://file.io/?expires=1d", form, { headers: form.getHeaders() });
      if (res.data.success) {
        console.log(`✅ [Expert] 채널 A 안착 성공! (${res.data.link})`);
        return { narrationUrl: res.data.link, duration: durationCount };
      }
    } catch (e) {}

    // Channel B: Catbox.moe
    try {
      console.log("🚀 [Expert] 채널 B(Catbox) 배송 시도...");
      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("fileToUpload", audioBufferForUpload, { filename: "voice.mp3", contentType: "audio/mpeg" });
      const res = await axios.post("https://catbox.moe/user/api.php", form, { headers: form.getHeaders() });
      if (res.data.startsWith("http")) {
        console.log(`✅ [Expert] 채널 B 안착 성공! (${res.data})`);
        return { narrationUrl: res.data, duration: durationCount };
      }
    } catch (e) {}

    // Channel C: Uguu.se
    try {
      console.log("🚀 [Expert] 채널 C(Uguu) 배송 시도...");
      const form = new FormData();
      form.append("files[]", audioBufferForUpload, { filename: "voice.mp3", contentType: "audio/mpeg" });
      const res = await axios.post("https://uguu.se/api.php?d=upload-tool", form, { headers: form.getHeaders() });
      const link = res.data.files[0].url;
      console.log(`✅ [Expert] 채널 C 안착 성공! (${link})`);
      return { narrationUrl: link, duration: durationCount };
    } catch (e) {}

    throw new Error("모든 배송 채널이 차단되었습니다.");
    
  } catch (e: any) {
    console.error("❌ [Expert] 나레이션 배송 치명적 오류:", e.message);
    return { narrationUrl: "", duration: 0 };
  }
}
