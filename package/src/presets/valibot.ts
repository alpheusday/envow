import type { Extension } from "#/@types/extension";
import type { StandardSchemaV1 } from "#/@types/standard";

import { boolean, picklist, string } from "valibot";

import { createExtension } from "#/functions/create/extension";

/**
 * Vite client-side environment preset.
 *
 * Describes the built-in constants Vite injects into `import.meta.env` on the
 * client (see https://vite.dev/guide/env-and-mode). User-defined `VITE_*`
 * variables are not covered — add them to your own `define`.
 */
const viteClient: Extension<{
    MODE: StandardSchemaV1<string, string>;
    BASE_URL: StandardSchemaV1<string, string>;
    PROD: StandardSchemaV1<boolean, boolean>;
    DEV: StandardSchemaV1<boolean, boolean>;
    SSR: StandardSchemaV1<boolean, boolean>;
}> = createExtension({
    define: {
        MODE: string(),
        BASE_URL: string(),
        PROD: boolean(),
        DEV: boolean(),
        SSR: boolean(),
    },
});

/**
 * Vite server-side environment preset.
 *
 * Adds `NODE_ENV` (set by Vite into `process.env`) on top of the client
 * constants. Use with `target: "server"` and a `runtimeEnv` that merges
 * `process.env` and `import.meta.env`.
 */
const viteServer: Extension<{
    NODE_ENV: StandardSchemaV1<string, string>;
    MODE: StandardSchemaV1<string, string>;
    BASE_URL: StandardSchemaV1<string, string>;
    PROD: StandardSchemaV1<boolean, boolean>;
    DEV: StandardSchemaV1<boolean, boolean>;
    SSR: StandardSchemaV1<boolean, boolean>;
}> = createExtension({
    extends: [
        viteClient,
    ],
    define: {
        NODE_ENV: string(),
    },
});

/**
 * Rsbuild client-side environment preset.
 *
 * Describes the constants Rsbuild injects into `import.meta.env` on the client
 * (see https://rsbuild.dev/guide/advanced/env-vars). User-defined `PUBLIC_*`
 * variables are not covered — add them to your own `define`.
 */
const rsbuildClient: Extension<{
    MODE: StandardSchemaV1<
        "production" | "development" | "none",
        "production" | "development" | "none"
    >;
    BASE_URL: StandardSchemaV1<string, string>;
    ASSET_PREFIX: StandardSchemaV1<string, string>;
    PROD: StandardSchemaV1<boolean, boolean>;
    DEV: StandardSchemaV1<boolean, boolean>;
    SSR: StandardSchemaV1<boolean, boolean>;
}> = createExtension({
    define: {
        MODE: picklist([
            "production",
            "development",
            "none",
        ]),
        BASE_URL: string(),
        ASSET_PREFIX: string(),
        PROD: boolean(),
        DEV: boolean(),
        SSR: boolean(),
    },
});

/**
 * Rsbuild server-side environment preset.
 *
 * Adds `NODE_ENV` (set by Rsbuild into `process.env`) on top of the client
 * constants. Use with `target: "server"` and a `runtimeEnv` that merges
 * `process.env` and `import.meta.env`.
 */
const rsbuildServer: Extension<{
    NODE_ENV: StandardSchemaV1<string, string>;
    MODE: StandardSchemaV1<
        "production" | "development" | "none",
        "production" | "development" | "none"
    >;
    BASE_URL: StandardSchemaV1<string, string>;
    ASSET_PREFIX: StandardSchemaV1<string, string>;
    PROD: StandardSchemaV1<boolean, boolean>;
    DEV: StandardSchemaV1<boolean, boolean>;
    SSR: StandardSchemaV1<boolean, boolean>;
}> = createExtension({
    extends: [
        rsbuildClient,
    ],
    define: {
        NODE_ENV: string(),
    },
});

export { rsbuildClient, rsbuildServer, viteClient, viteServer };
