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
    const { type, message, conversation, actions } = props;

    // ✅ Lab 5: 영상 제작 완료 알림 (workflow_callback)
    if (type === "workflow_callback") {
      const { finalVideoUrl, topic } = props.payload;
      await conversation.send({
        type: "text",
        payload: { 
          text: `🔔 [알림] "${topic}" 주제의 시네마틱 숏츠 제작이 완료되었습니다!\n\n🎬 지금 바로 확인하세요:\n${finalVideoUrl}` 
        },
      });
      return;
    }

    // 사용자 메시지 처리 (주제 추출)
    const topic: string = message?.payload?.text ?? "";
    if (!topic.trim()) return;

    try {
      // 1. 제미나이 기획 시작 안내
      await conversation.send({
        type: "text",
        payload: { text: `🧠 주제 "${topic}"에 대한 시네마틱 숏츠 기획을 시작합니다...` },
      });

      // 2. 기획 액션 호출 (여기서 워크플로우도 자동 시작됨)
      const result = await actions.generateshorts({ topic });

      // 3. 기획 결과 및 진행 상황 공유
      let planBrief = `📝 [기획 완료]\n🔥 Hook: ${result.hook}\n\n`;
      planBrief += `현재 백그라운드에서 고화질 영상 소스를 확보하고 한국어 성우 나레이션을 합성 중입니다. 3~5분 정도 소요됩니다. ⏳`;

      await conversation.send({
        type: "text",
        payload: { text: planBrief },
      });

      await conversation.send({
        type: "text",
        payload: { text: "영상이 완성되면 이곳으로 자동 알림을 보내드릴게요! 잠시만 다른 일을 하고 계셔도 좋습니다. 😊" },
      });

    } catch (e) {
      console.error("Pipeline start failed:", e);
      await conversation.send({
        type: "text",
        payload: { text: "❌ 봇 엔진 연결에 실패했습니다. 다시 시도해 주세요." },
      });
    }
  },
});
