import { z, defineConfig } from '@botpress/runtime';

export default defineConfig({
    name: 'shorts-lab',
    description: 'YouTube Shorts 자동화 봇 실습 프로젝트',

    defaultModels: {
        autonomous: "openai:gpt-4.1-mini",
        zai: "openai:gpt-4.1",
    },

    bot: {
        state: z.object({}),
    },

    user: {
        state: z.object({}),
    },

    dependencies: {
        integrations: {
            chat: { version: "chat@0.7.7", enabled: true },
            webchat: { version: "webchat@0.3.0", enabled: true },
        }
    },
});
