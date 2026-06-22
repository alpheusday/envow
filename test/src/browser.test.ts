import type { EnvEntry } from "#/helpers/build-env-tests";

import { vi } from "vitest";

import { mockedDefaultEnv } from "#/__fixtures__/env";
import { schemas } from "#/__fixtures__/schemas";
import { buildEnvTests } from "#/helpers/build-env-tests";

buildEnvTests({
    runtime: "browser",
    target: "client",
    schemas,
    setupGlobal: (): void => {
        vi.stubGlobal("window", {
            document: {},
        });
        vi.stubEnv(
            "_TEST_VERSION",
            String(mockedDefaultEnv._TEST_VERSION ?? ""),
        );
    },
    loadEntry: async (): Promise<EnvEntry> => {
        return await import("envow");
    },
    teardownGlobal: (): void => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    },
});
