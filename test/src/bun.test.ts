import type { EnvEntry } from "#/helpers/build-env-tests";

import { vi } from "vitest";

import { mockedDefaultEnv } from "#/__fixtures__/env";
import { schemas } from "#/__fixtures__/schemas";
import { buildEnvTests } from "#/helpers/build-env-tests";

buildEnvTests({
    runtime: "bun",
    target: "server",
    schemas,
    setupGlobal: (): void => {
        vi.stubGlobal("Bun", {
            env: {
                ...mockedDefaultEnv,
            },
        });
    },
    loadEntry: async (): Promise<EnvEntry> => {
        return await import("envow");
    },
    teardownGlobal: (): void => {
        vi.unstubAllGlobals();
    },
});
