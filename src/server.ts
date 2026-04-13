import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { MasterEngine } from './engine/masterEngine.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const PASSCODE = process.env.APP_PASSCODE || '1234';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// 실시간 요청 로그
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 임시 렌더 상태 저장소 (실제로는 DB 사용 권장)
const renderJobs = new Map();

// 패스코드 검증 미들웨어
function verifyPasscode(req: express.Request, res: express.Response, next: express.NextFunction) {
  const passcode = req.headers['x-gateway-passcode'] || req.body.passcode;
  
  if (passcode !== PASSCODE) {
    return res.status(403).json({ success: false, message: '잘못된 패스코드입니다.' });
  }
  
  next();
}

// POST /api/generate - 영상 생성 시작
app.post('/api/generate', verifyPasscode, async (req, res) => {
  const { topic, duration } = req.body;

  if (!topic) {
    return res.status(400).json({ success: false, message: '주제를 입력해주세요.' });
  }

  const minutes = [1, 3, 5, 10].includes(Number(duration)) ? Number(duration) : 3;
  console.log(`📝 영상 생성 요청: ${topic} (${minutes}분)`);

  const result = await MasterEngine.create(topic, minutes);

  if (!result.success || !result.renderId) {
    return res.status(500).json({
      success: false,
      message: result.error || '영상 생성에 실패했습니다.'
    });
  }

  renderJobs.set(result.renderId, { status: 'queued', percentage: 0, createdAt: new Date() });

  res.json({
    success: true,
    message: '영상 생성이 시작되었습니다.',
    renderId: result.renderId
  });
});

// GET /api/status/:renderId - 렌더링 상태 확인
app.get('/api/status/:renderId', verifyPasscode, async (req, res) => {
  try {
    const renderId = String(req.params.renderId);

    // Shotstack API로 상태 확인
    const status = await getShotstackRenderStatus(renderId);

    res.json(status);

  } catch (error: any) {
    console.error('❌ /api/status 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


async function getShotstackRenderStatus(renderId: string): Promise<any> {
  const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY;
  const SHOTSTACK_ENV = process.env.SHOTSTACK_ENV || 'stage';

  const response = await axios.get(
    `https://api.shotstack.io/${SHOTSTACK_ENV}/render/${renderId}`,
    {
      headers: { 'x-api-key': SHOTSTACK_API_KEY }
    }
  );

  const data = response.data.response;

  return {
    status: data.status, // queued, rendering, done, failed
    percentage: Math.round((data.progress || 0) * 100),
    url: data.url || null
  };
}

// 서버 시작 (0.0.0.0 — 같은 WiFi 기기에서도 접속 가능)
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🏛️  [ZenVideo Gateway] Server is running!`);
    console.log(`🖥️  내 PC:        http://127.0.0.1:${PORT}`);
    console.log(`📱  같은 WiFi:    http://192.168.219.92:${PORT}`);
    console.log(`🔐  패스코드:     ${PASSCODE}`);
});
