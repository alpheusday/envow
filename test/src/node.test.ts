import type { EnvEntry } from "#/helpers/build-env-tests";

import { mockedDefaultEnv } from "#/__fixtures__/env";
import { schemas } from "#/__fixtures__/schemas";
import { buildEnvTests } from "#/helpers/build-env-tests";

const ENV_KEYS = [
    "_TEST_VERSION",
    "_TEST_PORT",
    "_TEST_MODE",
] as const;

buildEnvTests({
    runtime: "node",
    target: "server",
    schemas,
    setupGlobal: (): void => {
        for (const key of ENV_KEYS) delete process.env[key];
        process.env._TEST_VERSION = String(
            mockedDefaultEnv._TEST_VERSION ?? "",
        );
    },
    loadEntry: async (): Promise<EnvEntry> => {
        return await import("envow");
    },
    teardownGlobal: (): void => {
        for (const key of ENV_KEYS) delete process.env[key];
    },
});
