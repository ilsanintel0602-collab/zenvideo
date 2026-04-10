import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

async function findWorkingModel() {
  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
  const versions = ["v1", "v1beta"];
  
  for (const v of versions) {
    for (const m of models) {
      try {
        console.log(`Checking ${v}/${m}...`);
        const res = await axios.post(
          `https://generativelanguage.googleapis.com/${v}/models/${m}:generateContent?key=${GEMINI_API_KEY}`,
          { contents: [{ parts: [{ text: "hi" }] }] }
        );
        if (res.data) {
          console.log(`✅ FOUND WORKING: ${v}/${m}`);
          process.exit(0);
        }
      } catch (e: any) {
        console.log(`❌ ${v}/${m} failed: ${e.response?.status}`);
      }
    }
  }
}

findWorkingModel();
