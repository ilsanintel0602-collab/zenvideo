/**
 * Lab 3: 이미지 생성 Helper (starter)
 *
 * DALL-E 3 API를 호출하여 6개의 장면 이미지 + 1개의 썸네일을 생성합니다.
 * TODO를 완성 후 src/helpers/generateImages.ts에 복사하세요.
 */

type GenerateImagesResult = {
  imageUrls: [string, string, string, string, string, string];
  thumbnailUrl: string;
};

// 이미지 1개를 생성하는 내부 함수
async function generateOne(prompt: string, apiKey: string): Promise<string> {
  // TODO 1: DALL-E 3 API를 호출하세요
  // 엔드포인트: https://api.openai.com/v1/images/generations
  // 헤더: Authorization: Bearer ${apiKey}, Content-Type: application/json
  // 본문: model, prompt, n, size (9:16 세로), quality, response_format
  const res = await fetch(/* TODO: 엔드포인트 */, {
    method: "POST",
    headers: {
      /* TODO: 헤더 */
    },
    body: JSON.stringify({
      /* TODO: 본문 파라미터 */
      // model: "dall-e-3"
      // prompt: prompt
      // n: 1
      // size: "???x???"  ← 9:16 세로 형식
      // quality: "standard"
      // response_format: "url"
    }),
  });

  // TODO 2: 오류 처리
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DALL-E 3 error: ${err}`);
  }

  // TODO 3: 응답에서 URL을 추출하세요
  // 힌트: 응답 형태 = { data: [{ url: "https://..." }] }
  const data = (await res.json()) as { data: { url: string }[] };
  return /* TODO */;
}

export async function generateImages(
  imagePrompts: string[],
  thumbnailPrompt: string
): Promise<GenerateImagesResult> {
  // TODO 4: 환경변수에서 API 키를 가져오세요
  const apiKey = /* TODO */;
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되지 않았습니다");

  // TODO 5: imagePrompts 6개 + thumbnailPrompt 1개를 합쳐서 allPrompts 배열을 만드세요
  const allPrompts = /* TODO */;

  // TODO 6: Promise.all()로 모든 이미지를 병렬 생성하세요
  // 힌트: allPrompts.map(p => generateOne(p, apiKey))
  const allUrls = await /* TODO */;

  // TODO 7: 결과를 imageUrls[6]과 thumbnailUrl로 분리하여 반환하세요
  return {
    imageUrls: /* TODO: 앞의 6개 */ as [string, string, string, string, string, string],
    thumbnailUrl: /* TODO: 마지막 1개 */,
  };
}
