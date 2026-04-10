import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function listModels() {
  try {
    // Note: The SDK might not have a direct listModels, so we'll try a simple generateContent on a known model
    // or use the REST API via axios.
    console.log("Checking API Key: " + GEMINI_API_KEY.substring(0, 10) + "...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("test");
    console.log("Success with gemini-1.5-flash");
  } catch (e: any) {
    console.error("Error Details:", e);
  }
}

listModels();
