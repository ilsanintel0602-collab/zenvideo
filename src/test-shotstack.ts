import "dotenv/config";
import axios from "axios";
import fs from "fs";
import path from "path";

async function absoluteVictory() {
    const apiKey = process.env.SHOTSTACK_API_KEY;
    if (!apiKey) return;

    const timeline = {
        background: "#000000",
        tracks: [
            {
                clips: [
                    {
                        asset: {
                            type: "text",
                            text: "VICTORY ACHIEVED",
                            font: { family: "manrope", size: 40, color: "#ffffff" }
                        },
                        start: 0,
                        length: 5
                    }
                ]
            }
        ]
    };
    const output = { format: "mp4", resolution: "sd" };

    try {
        console.log("🚀 [System] 절대 성공 엔진 가동...");
        const res = await axios.post("https://api.shotstack.io/stage/render", { timeline, output }, { headers: { "x-api-key": apiKey } });
        const renderId = res.data.response.id;
        console.log(`⏳ 렌더링 중 (ID: ${renderId})`);

        const outputDir = path.join(process.cwd(), "output");
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

        for (let i = 0; i < 60; i++) {
            await new Promise(r => setTimeout(r, 5000));
            const statusRes = await axios.get(`https://api.shotstack.io/stage/render/${renderId}`, { headers: { "x-api-key": apiKey } });
            const status = statusRes.data.response;
            if (status.status === "done") {
                const videoRes = await axios.get(status.url, { responseType: "arraybuffer" });
                fs.writeFileSync(path.join(outputDir, "victory.mp4"), Buffer.from(videoRes.data));
                console.log("📦 [SUCCESS] output/victory.mp4 배송 완료!");
                return;
            }
            if (status.status === "failed") {
                console.error("❌ 실패 상세:", JSON.stringify(status, null, 2));
                return;
            }
            process.stdout.write(".");
        }
    } catch (e: any) {
        console.error("❌ 에러:", e.response?.data || e.message);
    }
}

absoluteVictory();
