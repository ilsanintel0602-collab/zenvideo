/**
 * assembleVideo Helper — 완성본 제공 (수정 불필요)
 *
 * Shotstack API로 이미지 슬라이드쇼 + 나레이션 → 30초 MP4를 생성합니다.
 * 이 파일은 Lab 4에서 그대로 사용합니다 (수정 필요 없음).
 */

type AssembleVideoResult = {
  finalVideoUrl: string;
};

export async function assembleVideo(
  imageUrls: string[],
  hook: string,
  story: string[],
  thumbnailUrl: string,
  narrationUrl?: string
): Promise<AssembleVideoResult> {
  const apiKey = process.env.SHOTSTACK_API_KEY;
  if (!apiKey) throw new Error("SHOTSTACK_API_KEY가 설정되지 않았습니다");

  const env = process.env.SHOTSTACK_ENV ?? "stage";
  const base = `https://api.shotstack.io/edit/${env}`;
  const headers = {
    "x-api-key": apiKey,
    "Content-Type": "application/json",
  };

  const imageClips = imageUrls.map((url, i) => ({
    asset: { type: "image", src: url },
    start: i * 5,
    length: 5,
    effect: "zoomIn",
    transition: { in: "fade", out: "fade" },
  }));

  const subtitleClips = story.map((line, i) => ({
    asset: {
      type: "title",
      text: line,
      style: "minimal",
      color: "#ffffff",
      size: "small",
      background: "rgba(0,0,0,0.5)",
      position: "bottom",
    },
    start: i * 5 + 0.5,
    length: 4,
    position: "bottom",
    offset: { y: -0.1 },
  }));

  const hookClip = {
    asset: {
      type: "title",
      text: hook,
      style: "chunk",
      color: "#FFD700",
      size: "medium",
    },
    start: 0.5,
    length: 2.5,
    position: "top",
    offset: { y: 0.1 },
  };

  const timeline: any = {
    background: "#000000",
    tracks: [
      { clips: imageClips },
      { clips: subtitleClips },
      { clips: [hookClip] },
    ],
  };

  if (narrationUrl) {
    timeline.soundtrack = { src: narrationUrl, effect: "fadeOut", volume: 1 };
  }

  const output = {
    format: "mp4",
    fps: 30,
    size: { width: 720, height: 1280 },
    quality: "high",
  };

  const renderRes = await fetch(`${base}/render`, {
    method: "POST",
    headers,
    body: JSON.stringify({ timeline, output }),
  });

  if (!renderRes.ok) {
    const err = await renderRes.text();
    throw new Error(`Shotstack submit error: ${err}`);
  }

  const renderData = (await renderRes.json()) as {
    success: boolean;
    response: { id: string; status: string };
  };
  const renderId = renderData.response.id;

  const maxWaitMs = 5 * 60 * 1000;
  const intervalMs = 5000;
  let elapsed = 0;

  while (elapsed < maxWaitMs) {
    await new Promise((r) => setTimeout(r, intervalMs));
    elapsed += intervalMs;

    const statusRes = await fetch(`${base}/render/${renderId}`, { headers });
    if (!statusRes.ok) {
      const err = await statusRes.text();
      throw new Error(`Shotstack poll error: ${err}`);
    }

    const statusData = (await statusRes.json()) as {
      success: boolean;
      response: { status: string; url?: string; err?: string; error?: string };
    };
    const status = statusData.response;

    if (status.status === "done") return { finalVideoUrl: status.url! };
    if (status.status === "failed") {
      const reason = status.err ?? status.error ?? JSON.stringify(statusData);
      throw new Error(`Shotstack render failed: ${reason}`);
    }
  }

  throw new Error("Shotstack render timed out after 5 minutes");
}
