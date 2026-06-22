import { createEnv } from "envow";
import { viteClient } from "envow/presets/zod";
import { z } from "zod";

const env = createEnv({
    target: "client",
    runtimeEnv: import.meta.env,
    extends: [
        viteClient,
    ],
    define: {
        VITE_APP_TITLE: z.string(),
        VITE_API_URL: z.url(),
    },
});

export { env };
