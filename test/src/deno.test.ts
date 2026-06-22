import type { EnvEntry } from "#/helpers/build-env-tests";

import { vi } from "vitest";

import { mockedDefaultEnv } from "#/__fixtures__/env";
import { schemas } from "#/__fixtures__/schemas";
import { buildEnvTests } from "#/helpers/build-env-tests";

buildEnvTests({
    runtime: "deno",
    target: "server",
    schemas,
    setupGlobal: (): void => {
        vi.stubGlobal("Deno", {
            env: {
                toObject: () => ({
                    ...mockedDefaultEnv,
                }),
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
