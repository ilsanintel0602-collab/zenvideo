import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";

export async function generateNarration(
  text: string,
  storyboard: any[]
): Promise<{ narrationUrl: string; duration: number }> {
  const openAIKey    = (process.env.OPEN_AI_API_KEY || process.env.OPENAI_API_KEY || "").trim();
  const shotstackKey = (process.env.SHOTSTACK_API_KEY || "").trim();
  const shotstackEnv = process.env.SHOTSTACK_ENV || "stage";

  if (!openAIKey) {
    console.error("❌ [Narration] OPEN_AI_API_KEY가 없습니다.");
    return { narrationUrl: "", duration: 0 };
  }

  console.log("🎙️ [Narration] OpenAI TTS 나레이션 생성 시작...");

  // 1. OpenAI TTS 생성
  const ttsRes = await axios.post(
    "https://api.openai.com/v1/audio/speech",
    { model: "tts-1-hd", input: text, voice: "nova" },
    {
      headers: { Authorization: `Bearer ${openAIKey}`, "Content-Type": "application/json" },
      responseType: "arraybuffer",
      timeout: 60000
    }
  );

  const audioBuffer = Buffer.from(ttsRes.data);
  const durationEst = Math.ceil(audioBuffer.length / 16000);
  console.log(`✅ [Narration] TTS 생성 완료 (버퍼: ${(audioBuffer.length / 1024).toFixed(0)} KB)`);

  // 임시 파일 저장 (일부 채널에서 필요)
  const tempDir  = path.join(process.cwd(), "output");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  const tempPath = path.join(tempDir, `voice_${Date.now()}.mp3`);
  fs.writeFileSync(tempPath, audioBuffer);

  const uploadResult = await tryAllChannels(audioBuffer, tempPath, shotstackKey, shotstackEnv);

  try { fs.unlinkSync(tempPath); } catch {}

  if (uploadResult) {
    console.log(`✅ [Narration] 업로드 성공: ${uploadResult}`);
    return { narrationUrl: uploadResult, duration: durationEst };
  }

  console.error("❌ [Narration] 모든 채널 실패. 나레이션 없이 진행합니다.");
  return { narrationUrl: "", duration: durationEst };
}

async function tryAllChannels(
  audioBuffer: Buffer,
  tempPath: string,
  shotstackKey: string,
  shotstackEnv: string
): Promise<string | null> {

  // ── 채널 A: transfer.sh (PUT 방식, 가장 안정적) ──────────────────
  try {
    console.log("🚀 [Upload] 채널 A (transfer.sh) 시도...");
    const res = await axios.put(
      "https://transfer.sh/voice.mp3",
      audioBuffer,
      {
        headers: {
          "Content-Type": "audio/mpeg",
          "Max-Downloads": "3",
          "Max-Days": "1"
        },
        timeout: 30000
      }
    );
    const url = typeof res.data === "string" ? res.data.trim() : null;
    if (url?.startsWith("http")) {
      console.log(`✅ [Upload] 채널 A (transfer.sh) 성공!`);
      return url;
    }
  } catch (e: any) { console.warn(`⚠️ [Upload] 채널 A 실패: ${e.message}`); }

  // ── 채널 B: Catbox.moe ──────────────────────────────────────────
  try {
    console.log("🚀 [Upload] 채널 B (Catbox) 시도...");
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", audioBuffer, { filename: "voice.mp3", contentType: "audio/mpeg" });
    const res = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(), timeout: 25000
    });
    if (typeof res.data === "string" && res.data.startsWith("http")) {
      console.log(`✅ [Upload] 채널 B (Catbox) 성공!`);
      return res.data.trim();
    }
  } catch (e: any) { console.warn(`⚠️ [Upload] 채널 B 실패: ${e.message}`); }

  // ── 채널 C: 0x0.st ──────────────────────────────────────────────
  try {
    console.log("🚀 [Upload] 채널 C (0x0.st) 시도...");
    const form = new FormData();
    form.append("file", audioBuffer, { filename: "voice.mp3", contentType: "audio/mpeg" });
    const res = await axios.post("https://0x0.st", form, {
      headers: form.getHeaders(), timeout: 25000
    });
    if (typeof res.data === "string" && res.data.startsWith("http")) {
      console.log(`✅ [Upload] 채널 C (0x0.st) 성공!`);
      return res.data.trim();
    }
  } catch (e: any) { console.warn(`⚠️ [Upload] 채널 C 실패: ${e.message}`); }

  // ── 채널 D: tmpfiles.org ─────────────────────────────────────────
  try {
    console.log("🚀 [Upload] 채널 D (tmpfiles.org) 시도...");
    const form = new FormData();
    form.append("file", audioBuffer, { filename: "voice.mp3", contentType: "audio/mpeg" });
    const res = await axios.post("https://tmpfiles.org/api/v1/upload", form, {
      headers: form.getHeaders(), timeout: 25000
    });
    // tmpfiles.org URL: https://tmpfiles.org/xxx → direct: https://tmpfiles.org/dl/xxx
    const rawUrl: string = res.data?.data?.url ?? "";
    if (rawUrl.startsWith("http")) {
      const directUrl = rawUrl.replace("tmpfiles.org/", "tmpfiles.org/dl/");
      console.log(`✅ [Upload] 채널 D (tmpfiles.org) 성공!`);
      return directUrl;
    }
  } catch (e: any) { console.warn(`⚠️ [Upload] 채널 D 실패: ${e.message}`); }

  // ── 채널 E: File.io ──────────────────────────────────────────────
  try {
    console.log("🚀 [Upload] 채널 E (File.io) 시도...");
    const form = new FormData();
    form.append("file", audioBuffer, { filename: "voice.mp3", contentType: "audio/mpeg" });
    const res = await axios.post("https://file.io/?expires=1d", form, {
      headers: form.getHeaders(), timeout: 25000
    });
    if (res.data?.success && res.data?.link) {
      console.log(`✅ [Upload] 채널 E (File.io) 성공!`);
      return res.data.link;
    }
  } catch (e: any) { console.warn(`⚠️ [Upload] 채널 E 실패: ${e.message}`); }

  // ── 채널 F: Shotstack Ingest (최종 보루, 상태가 ready일 때만 사용) ──
  if (shotstackKey) {
    try {
      console.log("🚀 [Upload] 채널 F (Shotstack Ingest) 시도...");
      const form = new FormData();
      form.append("file", audioBuffer, { filename: "voice.mp3", contentType: "audio/mpeg" });
      const res = await axios.post(
        `https://api.shotstack.io/${shotstackEnv}/ingest/sources`,
        form,
        { headers: { ...form.getHeaders(), "x-api-key": shotstackKey }, timeout: 30000 }
      );
      // source: S3 URL (만료됨), url: CDN URL (처리 완료 후 사용 가능)
      const cdnUrl: string  = res.data?.data?.attributes?.url    ?? "";
      const s3Url:  string  = res.data?.data?.attributes?.source ?? "";
      const status: string  = res.data?.data?.attributes?.status ?? "";
      const useUrl = cdnUrl || s3Url;
      if (useUrl) {
        console.log(`✅ [Upload] 채널 F (Shotstack) 성공! 상태: ${status}`);
        return useUrl;
      }
    } catch (e: any) { console.warn(`⚠️ [Upload] 채널 F 실패: ${e.message}`); }
  }

  return null;
}
