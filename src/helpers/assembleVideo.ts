import axios from "axios";
import { VideoAsset } from "./generateVideos.js";

export async function assembleVideo(data: {
  videoAssets: VideoAsset[];
  narrationUrl: string;
  locations: string[];
  totalDuration: number;
}): Promise<{ videoUrl: string }> {
  const apiKey = process.env.SHOTSTACK_API_KEY;
  const env   = process.env.SHOTSTACK_ENV || "stage";
  if (!apiKey) throw new Error("SHOTSTACK_API_KEY가 없습니다.");

  const clipLength     = data.totalDuration / data.videoAssets.length;
  const narrationBuffer = 45;
  const lastIndex      = data.videoAssets.length - 1;

  console.log(`⏱️ [Sync] 총 ${data.videoAssets.length}개 클립, 각 ${clipLength.toFixed(1)}초`);
  console.log(`🔊 [Sync] 나레이션 URL: ${data.narrationUrl || "❌ 없음 (무음 영상)"}`);


  // ── 영상 트랙 ──────────────────────────────────────────
  const videoTrack = {
    clips: data.videoAssets.map((asset, i) => ({
      asset: {
        type: asset.type,
        src:  asset.url,
        ...(asset.type === "video" ? { volume: 0 } : {})
      },
      start:  parseFloat((i * clipLength).toFixed(3)),
      length: parseFloat((i === lastIndex ? clipLength + narrationBuffer : clipLength).toFixed(3)),
      ...(asset.type === "image" ? { effect: "zoomIn" } : {})
    }))
  };

  // ── 나레이션 트랙 ──────────────────────────────────────
  const audioTrack = data.narrationUrl ? [{
    clips: [{
      asset: { type: "audio", src: data.narrationUrl, volume: 1 },
      start:  0,
      length: parseFloat((data.totalDuration + narrationBuffer).toFixed(3))
    }]
  }] : [];

  const payload = {
    timeline: { tracks: [videoTrack, ...audioTrack] },
    output:   { format: "mp4", resolution: "hd" }
  };

  console.log("📦 [Assemble] 첫 번째 클립:", JSON.stringify(payload.timeline.tracks[0].clips[0], null, 2));
  console.log("📦 [Assemble] 트랙 수:", payload.timeline.tracks.length);

  try {
    const res = await axios.post(
      `https://api.shotstack.io/${env}/render`,
      payload,
      { headers: { "x-api-key": apiKey, "Content-Type": "application/json" } }
    );
    return { videoUrl: res.data.response.id };
  } catch (error: any) {
    if (error.response) {
      console.error("❌ [Assemble] Shotstack 오류:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("❌ [Assemble] 엔진 오류:", error.message);
    }
    throw error;
  }
}
