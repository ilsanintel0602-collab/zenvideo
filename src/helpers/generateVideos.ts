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
  prompts: (string | { primary: string; fallback: string })[]
): Promise<{ videoAssets: VideoAsset[] }> {
  const pexelsKey = process.env.PEXELS_API_KEY;
  console.log("🎬 [Visuals] Pexels Video API를 통해 시네마틱 클립을 검색합니다...");

  const videoAssets: VideoAsset[] = [];

  for (const prompt of prompts) {
    const primary = typeof prompt === "string" ? prompt : prompt.primary;
    const fallback = typeof prompt === "string" ? prompt : prompt.fallback;
    // 3단계: fallback의 첫 두 단어 (예: "Japan snowy mountain" → "Japan snowy")
    // Pexels에 관련 영상이 거의 확실히 존재하는 수준으로 단순화
    const last3 = fallback.split(" ").slice(0, 2).join(" ");

    const video = await searchPexelsVideo(primary, pexelsKey)
               ?? await searchPexelsVideo(fallback, pexelsKey)
               ?? (last3 !== fallback ? await searchPexelsVideo(last3, pexelsKey) : null);

    if (video) {
      videoAssets.push(video);
    } else {
      videoAssets.push({
        url: "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/images/mountains.jpg",
        type: "image"
      });
      console.warn(`⚠️ [Search] '${primary}' / '${fallback}' / '${last3}' 모두 결과 없음. 기본 이미지 사용.`);
    }
  }

  return { videoAssets };
}

async function searchPexelsVideo(query: string, pexelsKey: string | undefined): Promise<VideoAsset | null> {
  try {
    const res = await axios.get("https://api.pexels.com/videos/search", {
      params: { query, per_page: 5, orientation: "landscape", size: "large" },
      headers: { Authorization: pexelsKey }
    });

    if (!res.data.videos?.length) return null;

    // 후보 5개 중 가장 고화질(HD 이상) MP4 선별
    for (const video of res.data.videos) {
      const files: any[] = video.video_files ?? [];
      const best = files
        .filter((f: any) => f.file_type === "video/mp4")
        .sort((a: any, b: any) => (b.width ?? 0) - (a.width ?? 0))[0];

      if (best?.link && (best.width ?? 0) >= 1280) {
        console.log(`✅ [Search] '${query}' → ${best.width}×${best.height} HD 확보`);
        return { url: best.link, type: "video" };
      }
    }

    // HD 없으면 첫 번째 영상의 최선 파일 사용
    const fallbackFiles: any[] = res.data.videos[0].video_files ?? [];
    const fallback = fallbackFiles
      .filter((f: any) => f.file_type === "video/mp4")
      .sort((a: any, b: any) => (b.width ?? 0) - (a.width ?? 0))[0];

    if (fallback?.link) {
      console.log(`✅ [Search] '${query}' → ${fallback.width ?? '?'}px 확보 (SD)`);
      return { url: fallback.link, type: "video" };
    }

    return null;
  } catch {
    return null;
  }
}
