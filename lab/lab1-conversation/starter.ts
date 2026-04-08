/**
 * Lab 1: 대화 핸들러 (starter)
 *
 * TODO를 모두 완성하면 adk chat에서 사용자 메시지를 받아 응답할 수 있습니다.
 * 완성 후 이 파일의 내용을 src/conversations/index.ts에 복사하세요.
 */

import { Conversation } from "@botpress/runtime";

export default new Conversation({
  // TODO 1: channel을 설정하세요.
  // 힌트: 모든 채널에서 메시지를 받으려면 와일드카드 문자를 사용합니다.
  channel: /* TODO */ "",

  handler: async (props: any) => {
    // props에서 필요한 값을 꺼냅니다
    const { type, message, conversation } = props;

    // TODO 2: workflow_callback 타입이면 건너뜁니다 (Lab 5에서 구현)
    // 힌트: if (type === "???") return;
    /* TODO */

    // TODO 3: 사용자가 입력한 텍스트를 추출하세요
    // 힌트: message.payload.text, 없으면 ""
    const topic: string = /* TODO */ "";

    // TODO 4: topic이 비어있으면 무시하세요
    /* TODO */

    // TODO 5: 사용자에게 응답을 전송하세요
    // 힌트: conversation.send({ type: "text", payload: { text: "..." } })
    await conversation.send({
      /* TODO */
    });
  },
});
