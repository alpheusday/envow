import { createEnv } from "envow";
import { viteServer } from "envow/presets/zod";
import { z } from "zod";

const env = createEnv({
    target: "server",
    runtimeEnv: {
        ...process.env,
        ...import.meta.env,
    },
    extends: [
        viteServer,
    ],
    define: {
        VITE_PORT: z.coerce.number().default(3000),
        VITE_MESSAGE: z.string().min(1),
    },
});

export { env };
