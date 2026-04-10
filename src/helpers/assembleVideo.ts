import axios from "axios";
import { VideoAsset } from "./generateVideos.js";

/**
 * assembleVideo Helper — Professional Cinematic Edition
 * 한글 폰트 주입 및 시네마틱 레이아웃을 완성합니다.
 */
export async function assembleVideo(data: {
  videoAssets: VideoAsset[];
  narrationUrl: string;
  storyboard: string[];
  totalDuration: number;
}): Promise<{ videoUrl: string }> {
  const apiKey = process.env.SHOTSTACK_API_KEY;
  if (!apiKey) throw new Error("SHOTSTACK_API_KEY가 없습니다.");

  console.log("🎬 [Assemble] 시네마틱 마스터피스 조립 시작...");

  // 장면당 재생 시간 자동 계산 (전체 길이 / 장면 수)
  const clipLength = data.totalDuration / data.storyboard.length;
  console.log(`⏱️ [Sync] 장면당 재생 시간: ${clipLength.toFixed(1)}초`);

  const timeline = {
    tracks: [
      {
        clips: data.videoAssets.map((asset, i) => ({
          asset: { 
            type: asset.type, // "video" or "image"
            src: asset.url 
          },
          start: i * clipLength,
          length: clipLength,
          effect: asset.type === "image" ? "zoomIn" : undefined // 이미지일 경우 줌 효과 추가 (심심함 방지)
        }))
      },
      {
        clips: [
          {
            asset: { type: "audio", src: data.narrationUrl },
            start: 0,
            length: data.totalDuration
          }
        ]
      }
    ]
  };

  try {
    const res = await axios.post(
      "https://api.shotstack.io/stage/render",
      { timeline, output: { format: "mp4", resolution: "hd" } }, 
      { headers: { "x-api-key": apiKey, "Content-Type": "application/json" } }
    );
    // Shotstack renderId를 videoUrl이라는 키로 반환 (MasterEngine 호환성 유지)
    return { videoUrl: res.data.response.id };
  } catch (error: any) {
    if (error.response) {
      console.error("❌ [Assemble] Shotstack API 오류 상세:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("❌ [Assemble] 엔진 오류:", error.message);
    }
    throw error;
  }
}

