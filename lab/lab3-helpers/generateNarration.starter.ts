/**
 * Lab 3: 나레이션 생성 Helper (starter)
 *
 * OpenAI TTS로 한국어 MP3를 생성하고, catbox.moe에 업로드하여 URL을 반환합니다.
 * TODO를 완성 후 src/helpers/generateNarration.ts에 복사하세요.
 */

type GenerateNarrationResult = {
  narrationUrl: string;
};

export async function generateNarration(
  hook: string,
  story: string[]
): Promise<GenerateNarrationResult> {
  // TODO 1: 환경변수에서 OpenAI API 키를 가져오세요
  const openaiKey = /* TODO */;
  if (!openaiKey) throw new Error("OPENAI_API_KEY가 설정되지 않았습니다");

  // TODO 2: hook과 story를 하나의 스크립트 문자열로 합치세요
  // 힌트: [hook, ...story].join(". ")
  const script = /* TODO */;

  // TODO 3: OpenAI TTS API를 호출하세요
  // 엔드포인트: https://api.openai.com/v1/audio/speech
  // 헤더: Authorization, Content-Type
  // 본문: model ("tts-1"), input (script), voice ("nova"), response_format ("mp3"), speed (1.0)
  const ttsRes = await fetch(/* TODO: 엔드포인트 */, {
    method: "POST",
    headers: {
      /* TODO: 헤더 */
    },
    body: JSON.stringify({
      /* TODO: 본문 파라미터 */
    }),
  });

  if (!ttsRes.ok) {
    const err = await ttsRes.text();
    throw new Error(`OpenAI TTS error: ${err}`);
  }

  // TODO 4: 응답 바이너리 데이터를 ArrayBuffer로 변환하세요
  const audioBuffer = /* TODO */;

  // TODO 5: catbox.moe에 MP3 파일을 업로드하세요
  // FormData를 사용하여 multipart/form-data 전송
  // - reqtype: "fileupload"
  // - fileToUpload: Blob (audio/mpeg 타입, 파일명 "narration.mp3")
  const formData = new FormData();
  /* TODO: formData.append() 두 번 */

  const uploadRes = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    throw new Error(`catbox.moe upload failed: ${uploadRes.status}`);
  }

  // TODO 6: 응답 텍스트로 URL을 추출하고, "http"로 시작하는지 검증하세요
  const narrationUrl = /* TODO: (await uploadRes.text()).trim() */;
  if (!narrationUrl.startsWith("http")) {
    throw new Error(`catbox.moe returned unexpected response: ${narrationUrl}`);
  }

  return { narrationUrl };
}
