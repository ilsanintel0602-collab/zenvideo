import axios from "axios";
import "dotenv/config";

async function testLab3() {
    const apiKey = process.env.SHOTSTACK_API_KEY;
    const timeline = {
        background: "#000000",
        tracks: [
            {
                clips: [
                    {
                        asset: {
                            type: "image",
                            src: "https://shotstack-assets.s3.amazonaws.com/images/puppy.jpg"
                        },
                        start: 0,
                        length: 5
                    }
                ]
            }
        ]
    };
    const output = { format: "mp4", resolution: "hd" };

    try {
        console.log("🎬 [Lab3] 렌더링 테스트 중...");
        const res = await axios.post(
            "https://api.shotstack.io/stage/render",
            { timeline, output },
            { headers: { "x-api-key": apiKey } }
        );
        console.log("✅ 성공! ID:", res.data.response.id);
    } catch (e: any) {
        console.error("❌ 실패:", e.response?.data || e.message);
    }
}
testLab3();
