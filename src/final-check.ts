import "dotenv/config";
import { generateImages } from "./helpers/generateImages";
import { generateNarration } from "./helpers/generateNarration";
import { assembleVideo } from "./helpers/assembleVideo";
import fs from "fs";
import axios from "axios";
import path from "path";

async function cinematicDemo() {
    console.log("🎬 [Demo] 고품격 시네마틱 숏츠 제작을 시작합니다...");

    // 1. 시네마틱 장면 구성 (키워드 다변화)
    const sceneKeywords = [
        "golden retriever puppy soft sunlight",
        "puppy running through flower garden",
        "close up puppy eyes looking at camera",
        "happy puppy jumping on green grass",
        "puppy relaxing under big tree"
    ];

    // 2. 감성적인 스토리보드 (자막 & 나레이션)
    const storyboard = [
        "세상에서 가장 평화로운 오후예요.",
        "햇살을 가르며 뛰어노는 귀여운 친구들!",
        "저 초롱초롱한 눈빛을 좀 보세요.",
        "바라만 봐도 입가에 미소가 번지죠?",
        "오늘 하루도 강아지들처럼 행복하세요."
    ];

    try {
        // 음성 및 이미지 생성 (병렬 처리로 속도 향상)
        console.log("🎨 [Demo] 시각 및 청각 에셋 생성 중...");
        const [assets, audio] = await Promise.all([
            generateImages(sceneKeywords, sceneKeywords[0]),
            generateNarration(storyboard.join(" "), storyboard)
        ]);

        // 최종 영상 조립 (HD 고화질)
        console.log("📽️ [Demo] 시네마틱 엔진 가동 (HD 렌더링)...");
        const { finalVideoUrl } = await assembleVideo(
            assets.imageUrls, 
            "평화로운 오후", 
            storyboard, 
            assets.thumbnailUrl, 
            audio.narrationUrl
        );

        // 4. 물리적 결과물 다운로드 (Real Responsibility)
        const outputDir = path.join(process.cwd(), "output");
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

        console.log("📥 [Demo] 결과물 물리 배송 중 (Local Download)...");
        
        const videoPath = path.join(outputDir, "victory.mp4");
        const audioPath = path.join(outputDir, "voice.mp3");

        const [videoRes, audioRes] = await Promise.all([
            axios.get(finalVideoUrl, { responseType: "arraybuffer" }),
            axios.get(audio.narrationUrl, { responseType: "arraybuffer" })
        ]);

        fs.writeFileSync(videoPath, Buffer.from(videoRes.data));
        fs.writeFileSync(audioPath, Buffer.from(audioRes.data));

        console.log("\n==========================================");
        console.log(" ✅ [완공] 모든 결과물이 사용자님의 컴퓨터에 저장되었습니다!");
        console.log(" 📁 폴더: " + outputDir);
        console.log(" 🎬 동영상: output/victory.mp4");
        console.log(" 🎙️ 나레이션: output/voice.mp3");
        console.log("==========================================");
        console.log(" 💡 사용자님, 이제 브라우저가 아닌 '내 컴퓨터'에서 확인하십시오.");
    } catch (e: any) {
        console.error(" ❌ [Demo] 실패:", e.message);
    }
}

cinematicDemo().catch(console.error);
