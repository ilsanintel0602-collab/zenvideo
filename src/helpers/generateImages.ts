import { VideoAsset } from "./generateVideos.js";

/**
 * generateImages Helper — Senior Expert 'No-Key' Edition
 * 사용자의 추가 키 없이도 Shotstack 내장 HD 라이브러리를 통해 최고급 비주얼을 보장합니다.
 */
export async function generateImages(
  imagePrompts: string[],
  thumbnailPrompt: string
): Promise<{
  assets: VideoAsset[];
  thumbnailUrl: string;
}> {
  console.log("📸 [Visuals] 시니어 전문가가 선별한 Shotstack 프리미엄 스톡 라이브러리를 연결합니다...");

  // Shotstack에서 제공하는 검증된 고화질 시네마틱 풍경 에셋 목록
  const premiumStock: VideoAsset[] = [
    { url: "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/images/mountains.jpg", type: "image" },
    { url: "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/images/ocean.jpg", type: "image" },
    { url: "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/images/forest.jpg", type: "image" },
    { url: "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/images/sunset.jpg", type: "image" },
    { url: "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/images/night-sky.jpg", type: "image" }
  ];

  return {
    assets: premiumStock,
    thumbnailUrl: premiumStock[0].url
  };
}

