import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

async function listModels() {
  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`
    );
    console.log("✅ Available Models (v1):", JSON.stringify(response.data.models.map((m: any) => m.name), null, 2));
  } catch (e: any) {
    console.log("❌ v1 list failed, trying v1beta...");
    try {
      const response = await axios.get(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
      );
      console.log("✅ Available Models (v1beta):", JSON.stringify(response.data.models.map((m: any) => m.name), null, 2));
    } catch (e2: any) {
      console.error("❌ Both v1 and v1beta failed.");
      if (e2.response) console.error(JSON.stringify(e2.response.data, null, 2));
    }
  }
}

listModels();
