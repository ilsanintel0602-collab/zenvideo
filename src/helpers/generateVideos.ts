import axios from "axios";

/**
 * [Masterpiece] Visual Engine — Pexels Video Edition
 * 정지된 사진이 아닌, 살아 움직이는 고화질 비디오 클립을 검색하여 가져옵니다.
 */
export interface VideoAsset {
  url: string;
  type: "video" | "image";
}

export async function generateVideos(
  prompts: string[]
): Promise<{ videoAssets: VideoAsset[] }> {
  const pexelsKey = process.env.PEXELS_API_KEY;
  console.log("🎬 [Visuals] Pexels Video API를 통해 시네마틱 클립을 검색합니다...");

  const videoAssets: VideoAsset[] = [];

  try {
    for (const prompt of prompts) {
      // 1. Pexels 비디오 검색 (가로형, 자연/풍경 위주)
      const res = await axios.get("https://api.pexels.com/videos/search", {
        params: {
          query: prompt,
          per_page: 1,
          orientation: "landscape",
          size: "medium"
        },
        headers: { Authorization: pexelsKey }
      });

      if (res.data.videos && res.data.videos.length > 0) {
        // 2. Shotstack에서 재생 가능한 MP4 파일 링크 추출
        const videoFiles = res.data.videos[0].video_files;
        const bestFile = videoFiles.find((f: any) => f.file_type === "video/mp4" && f.width >= 1280) || videoFiles[0];
        
        if (bestFile && bestFile.link) {
          videoAssets.push({ url: bestFile.link, type: "video" });
          console.log(`✅ [Search] '${prompt}' 매칭 비디오 확보: ${bestFile.link.substring(0, 40)}...`);
        } else {
          throw new Error(`Video file not found for prompt: ${prompt}`);
        }
      } else {
        // 3. 검색 결과 없을 시 고화질 시네마틱 이미지로 대체 (Asset Type: image)
        const fallbackUrl = "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/images/mountains.jpg";
        videoAssets.push({ url: fallbackUrl, type: "image" });
        console.log(`⚠️ [Search] '${prompt}' 결과 없음. 프리미엄 이미지 스톡으로 보완.`);
      }
    }

    return { videoAssets };
  } catch (err: any) {
    console.error("❌ [Visuals] Video API 통신 오류:", err.message);
    // 오류 시 안전을 위해 기본 시네마틱 이미지 리턴
    return { 
      videoAssets: [{ 
        url: "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/images/mountains.jpg", 
        type: "image" 
      }] 
    };
  }
}
