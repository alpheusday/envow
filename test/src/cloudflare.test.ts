import type { EnvEntry } from "#/helpers/build-env-tests";

import { vi } from "vitest";

import { mockedDefaultEnv } from "#/__fixtures__/env";
import { schemas } from "#/__fixtures__/schemas";
import { buildEnvTests } from "#/helpers/build-env-tests";

vi.mock("cloudflare:workers", () => ({
    env: {
        ...mockedDefaultEnv,
    },
}));

buildEnvTests({
    runtime: "cloudflare",
    target: "server",
    schemas,
    setupGlobal: (): void => {
        // The `cloudflare:workers` mock is hoisted by `vi.mock` above; nothing
        // else to set up per-test.
    },
    loadEntry: async (): Promise<EnvEntry> => {
        return await import("envow");
    },
    teardownGlobal: (): void => {
        // Nothing to tear down — the hoisted mock persists for the file.
    },
});
