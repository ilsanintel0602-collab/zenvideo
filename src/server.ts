import "dotenv/config";
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { MasterEngine } from './engine/masterEngine.js';

// --- [API Health Check] ---
const requiredKeys = ["GEMINI_API_KEY", "PEXELS_API_KEY", "SHOTSTACK_API_KEY", "OPEN_AI_API_KEY"];
console.log("🔍 [Security] API 키 무결성 검사 중...");
requiredKeys.forEach(key => {
  if (!process.env[key]) {
    console.error(`⚠️ [Critical] 환경 변수 누락됨: ${key}`);
  } else {
    console.log(`✅ [Security] ${key} 로드 완료.`);
  }
});
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3000;
const PASSCODE = process.env.APP_PASSCODE || "1234";

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

process.on('uncaughtException', (err) => {
  console.error('💥 [Global] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 [Global] Unhandled Rejection at:', promise, 'reason:', reason);
});

// --- [Security Middleware] ---
const gatewaySecurity = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const userPasscode = req.headers['x-gateway-passcode'] || req.body.passcode;
  
  if (userPasscode !== PASSCODE) {
    console.warn(`🚨 [Security] Unauthorized access attempt from ${req.ip}`);
    return res.status(401).json({ success: false, message: "Invalid Passcode. Access Denied." });
  }
  next();
};

// --- [Health Check] ---
app.get('/', (req, res) => {
  res.json({ status: "online", service: "ZenVideo Master API", version: "1.0.0" });
});

// --- [Video Generation Endpoint] ---
app.post('/api/generate', gatewaySecurity, async (req, res) => {
  const { topic } = req.body;
  
  if (!topic) {
    return res.status(400).json({ success: false, message: "Topic is required." });
  }

  console.log(`📡 [API] Received generation request for: "${topic}"`);
  
  // We trigger the engine but don't wait for the long render to finish before responding
  const result = await MasterEngine.create(topic);

  if (result.success) {
    res.json({
      success: true,
      message: "Production started successfully.",
      renderId: result.videoUrl,
      status: "rendering"
    });
  } else {
    console.error("🚨 [Critical Error] Generation Failed:", result.error);
    res.status(500).json({
      success: false,
      message: "Failed to start production. Check server logs.",
      error: typeof result.error === 'string' ? result.error : JSON.stringify(result.error)
    });
  }
});

// --- [Status Check Endpoint] ---
app.get('/api/status/:id', async (req, res) => {
  const renderId = req.params.id;
  const apiKey = process.env.SHOTSTACK_API_KEY;

  try {
    const statusRes = await axios.get(`https://api.shotstack.io/stage/render/${renderId}`, {
      headers: { "x-api-key": apiKey }
    });
    
    const shotstackResponse = statusRes.data.response;
    
    res.json({
      success: true,
      status: shotstackResponse.status, // done, rendering, failed, etc.
      url: shotstackResponse.url || null,
      percentage: shotstackResponse.percentage || 0
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Status check failed.", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🏛️  [ZenVideo Gateway] Server is running on http://localhost:${PORT}`);
  console.log(`🔐 [Security] Gateway Passcode active.`);
});

// Keep-alive mechanism to prevent early exit in certain CI/CD or restricted environments
setInterval(() => {
  // Do nothing, just keep the process alive
}, 1000 * 60 * 60);
