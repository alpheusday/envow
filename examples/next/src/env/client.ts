import { createEnv } from "envow";
import { z } from "zod";

const env = createEnv({
    target: "client",
    conditions: {
        client: true,
    },
    runtimeEnv: {
        NEXT_PUBLIC_APP_TITLE: process.env.NEXT_PUBLIC_APP_TITLE,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },
    define: {
        NEXT_PUBLIC_APP_TITLE: z.string(),
        NEXT_PUBLIC_API_URL: z.url(),
    },
});

export { env };
