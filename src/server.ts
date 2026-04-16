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

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 작업 상태 저장소
// status: 'preparing' | 'rendering' | 'done' | 'failed'
const renderJobs = new Map<string, {
  status: string;
  shotstackId?: string;
  url?: string;
  error?: string;
  createdAt: Date;
}>();

function verifyPasscode(req: express.Request, res: express.Response, next: express.NextFunction) {
  const passcode = req.headers['x-gateway-passcode'] || req.body.passcode;
  if (passcode !== PASSCODE) {
    return res.status(403).json({ success: false, message: '잘못된 패스코드입니다.' });
  }
  next();
}

// POST /api/generate — 즉시 jobId 반환, 처리는 백그라운드
app.post('/api/generate', verifyPasscode, async (req, res) => {
  const { topic, duration } = req.body;

  if (!topic) {
    return res.status(400).json({ success: false, message: '주제를 입력해주세요.' });
  }

  const minutes = [1, 3, 5, 10].includes(Number(duration)) ? Number(duration) : 3;
  const jobId = `job_${Date.now()}`;

  console.log(`📝 [${jobId}] 영상 생성 요청: "${topic}" (${minutes}분)`);

  // 즉시 응답 → 브라우저 타임아웃 방지
  renderJobs.set(jobId, { status: 'preparing', createdAt: new Date() });
  res.json({ success: true, message: '영상 생성이 시작되었습니다.', renderId: jobId });

  // 백그라운드에서 실제 처리
  (async () => {
    try {
      const result = await MasterEngine.create(topic, minutes);

      if (!result.success || !result.renderId) {
        renderJobs.set(jobId, {
          status: 'failed',
          error: result.error || '영상 생성에 실패했습니다.',
          createdAt: new Date()
        });
        console.error(`❌ [${jobId}] 실패:`, result.error);
        return;
      }

      // Shotstack 렌더 ID 확보 → 이제 Shotstack에 폴링
      renderJobs.set(jobId, {
        status: 'rendering',
        shotstackId: result.renderId,
        createdAt: new Date()
      });
      console.log(`🎬 [${jobId}] Shotstack 렌더링 시작: ${result.renderId}`);

    } catch (err: any) {
      renderJobs.set(jobId, {
        status: 'failed',
        error: err.message,
        createdAt: new Date()
      });
      console.error(`❌ [${jobId}] 예외:`, err.message);
    }
  })();
});

// GET /api/status/:renderId — 상태 확인
app.get('/api/status/:renderId', verifyPasscode, async (req, res) => {
  const jobId = String(req.params.renderId);
  const job = renderJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ status: 'unknown', message: '작업을 찾을 수 없습니다.' });
  }

  // 아직 AI 처리 중
  if (job.status === 'preparing') {
    return res.json({ status: 'queued', percentage: 10 });
  }

  // 실패
  if (job.status === 'failed') {
    return res.json({ status: 'failed', message: job.error });
  }

  // 이미 완료된 작업 (캐시)
  if (job.status === 'done' && job.url) {
    return res.json({ status: 'done', url: job.url, percentage: 100 });
  }

  // Shotstack 렌더링 중 → Shotstack에 실시간 폴링
  if (job.status === 'rendering' && job.shotstackId) {
    try {
      const shotstack = await getShotstackRenderStatus(job.shotstackId);

      if (shotstack.status === 'done' && shotstack.url) {
        renderJobs.set(jobId, { ...job, status: 'done', url: shotstack.url });
      }

      return res.json(shotstack);
    } catch (err: any) {
      return res.status(500).json({ status: 'failed', message: err.message });
    }
  }

  res.json({ status: job.status, percentage: 0 });
});

async function getShotstackRenderStatus(renderId: string): Promise<any> {
  const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY;
  const SHOTSTACK_ENV = process.env.SHOTSTACK_ENV || 'stage';

  const response = await axios.get(
    `https://api.shotstack.io/${SHOTSTACK_ENV}/render/${renderId}`,
    { headers: { 'x-api-key': SHOTSTACK_API_KEY } }
  );

  const data = response.data.response;
  return {
    status: data.status,
    percentage: Math.round((data.progress || 0) * 100),
    url: data.url || null
  };
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🏛️  [ZenVideo] 서버 실행 중 — PORT ${PORT}`);
  console.log(`🌐  배포 주소:  https://zenvideo-production.up.railway.app`);
  console.log(`🔐  패스코드:   ${PASSCODE}`);
});
