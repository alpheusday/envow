import { createEnv } from "envow";
import { z } from "zod";

const env = createEnv({
    target: "server",
    runtimeEnv: process.env,
    define: {
        NODE_ENV: z
            .enum([
                "development",
                "production",
            ])
            .default("development"),
        PORT: z.coerce.number().default(3000),
        MESSAGE: z.string().min(1),
    },
});

export { env };
