/**
 * 대화 핸들러 — Lab 1에서 구현합니다.
 *
 * 현재: 사용자 메시지를 받아 에코 응답
 * Lab 1 완료 후: topic 추출 + 응답 전송
 * Lab 2 완료 후: generateshorts action 호출
 * Lab 4 완료 후: videoAutomation workflow 시작
 * Lab 5 완료 후: workflow_callback 처리 + table 기록
 */

import { Conversation } from "@botpress/runtime";

export default new Conversation({
  channel: "*",
  handler: async (props: any) => {
    const { type, message, conversation } = props;

    // Lab 5에서 구현: workflow_callback 처리
    if (type === "workflow_callback") return;

    // 사용자 메시지 처리
    const topic: string = message?.payload?.text ?? "";
    if (!topic.trim()) return;

    // Lab 1: 기본 응답 전송
    await conversation.send({
      type: "text",
      payload: { text: `"${topic}" 주제로 영상을 만들겠습니다! (Lab 2~5를 완성해주세요)` },
    });

    // TODO Lab 2: actions.generateshorts({ topic }) 호출
    // TODO Lab 4: videoAutomation.start({ ... }) 호출
    // TODO Lab 5: videoJobs.createRows({ ... }) 호출
  },
});
