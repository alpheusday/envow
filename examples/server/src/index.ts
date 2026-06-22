import { Hono } from "hono";

import { env } from "./env";

const app: Hono = new Hono();

app.get("/", (c): Response => {
    return c.json({
        success: true,
    });
});

app.get("/health", (c): Response => {
    return c.json({
        success: true,
        data: {
            port: env.VITE_PORT,
        },
    });
});

app.get("/message", (c): Response => {
    return c.json({
        success: true,
        data: {
            message: env.VITE_MESSAGE,
        },
    });
});

export default app;
