import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { Extension, StandardSchemaDictionary } from "envow";

import { createEnv, createExtension } from "envow";
import {
    rsbuildClient as arktypeRsbuildClient,
    rsbuildServer as arktypeRsbuildServer,
    viteClient as arktypeViteClient,
    viteServer as arktypeViteServer,
} from "envow/presets/arktype";
import {
    rsbuildClient as valibotRsbuildClient,
    rsbuildServer as valibotRsbuildServer,
    viteClient as valibotViteClient,
    viteServer as valibotViteServer,
} from "envow/presets/valibot";
import {
    rsbuildClient as zodRsbuildClient,
    rsbuildServer as zodRsbuildServer,
    viteClient as zodViteClient,
    viteServer as zodViteServer,
} from "envow/presets/zod";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

type PresetCase = {
    name: string;
    target: "client" | "server";
    preset: Extension<StandardSchemaDictionary>;
    runtimeEnv: Record<string, string | number | boolean | undefined>;
    expected: Record<string, unknown>;
    missingKey: string;
};

const VITE_CLIENT_ENV = {
    MODE: "development",
    BASE_URL: "/",
    PROD: false,
    DEV: true,
    SSR: false,
};

const VITE_SERVER_ENV = {
    NODE_ENV: "production",
    MODE: "production",
    BASE_URL: "/",
    PROD: true,
    DEV: false,
    SSR: true,
};

const RSBUILD_CLIENT_ENV = {
    MODE: "development",
    BASE_URL: "/",
    ASSET_PREFIX: "/",
    PROD: false,
    DEV: true,
    SSR: false,
};

const RSBUILD_SERVER_ENV = {
    NODE_ENV: "production",
    MODE: "production",
    BASE_URL: "/",
    ASSET_PREFIX: "https://example.com",
    PROD: true,
    DEV: false,
    SSR: true,
};

const cases: readonly PresetCase[] = [
    {
        name: "zod viteClient",
        target: "client",
        preset: zodViteClient,
        runtimeEnv: VITE_CLIENT_ENV,
        expected: VITE_CLIENT_ENV,
        missingKey: "MODE",
    },
    {
        name: "zod viteServer",
        target: "server",
        preset: zodViteServer,
        runtimeEnv: VITE_SERVER_ENV,
        expected: VITE_SERVER_ENV,
        missingKey: "NODE_ENV",
    },
    {
        name: "zod rsbuildClient",
        target: "client",
        preset: zodRsbuildClient,
        runtimeEnv: RSBUILD_CLIENT_ENV,
        expected: RSBUILD_CLIENT_ENV,
        missingKey: "MODE",
    },
    {
        name: "zod rsbuildServer",
        target: "server",
        preset: zodRsbuildServer,
        runtimeEnv: RSBUILD_SERVER_ENV,
        expected: RSBUILD_SERVER_ENV,
        missingKey: "NODE_ENV",
    },
    {
        name: "valibot viteClient",
        target: "client",
        preset: valibotViteClient,
        runtimeEnv: VITE_CLIENT_ENV,
        expected: VITE_CLIENT_ENV,
        missingKey: "MODE",
    },
    {
        name: "valibot viteServer",
        target: "server",
        preset: valibotViteServer,
        runtimeEnv: VITE_SERVER_ENV,
        expected: VITE_SERVER_ENV,
        missingKey: "NODE_ENV",
    },
    {
        name: "valibot rsbuildClient",
        target: "client",
        preset: valibotRsbuildClient,
        runtimeEnv: RSBUILD_CLIENT_ENV,
        expected: RSBUILD_CLIENT_ENV,
        missingKey: "MODE",
    },
    {
        name: "valibot rsbuildServer",
        target: "server",
        preset: valibotRsbuildServer,
        runtimeEnv: RSBUILD_SERVER_ENV,
        expected: RSBUILD_SERVER_ENV,
        missingKey: "NODE_ENV",
    },
    {
        name: "arktype viteClient",
        target: "client",
        preset: arktypeViteClient,
        runtimeEnv: VITE_CLIENT_ENV,
        expected: VITE_CLIENT_ENV,
        missingKey: "MODE",
    },
    {
        name: "arktype viteServer",
        target: "server",
        preset: arktypeViteServer,
        runtimeEnv: VITE_SERVER_ENV,
        expected: VITE_SERVER_ENV,
        missingKey: "NODE_ENV",
    },
    {
        name: "arktype rsbuildClient",
        target: "client",
        preset: arktypeRsbuildClient,
        runtimeEnv: RSBUILD_CLIENT_ENV,
        expected: RSBUILD_CLIENT_ENV,
        missingKey: "MODE",
    },
    {
        name: "arktype rsbuildServer",
        target: "server",
        preset: arktypeRsbuildServer,
        runtimeEnv: RSBUILD_SERVER_ENV,
        expected: RSBUILD_SERVER_ENV,
        missingKey: "NODE_ENV",
    },
];

describe("extensions", (): void => {
    for (const c of cases) {
        describe(c.name, (): void => {
            it("validates and returns the expected env", (): void => {
                const env = createEnv({
                    target: c.target,
                    conditions: {
                        [c.target]: true,
                    },
                    runtimeEnv: c.runtimeEnv,
                    extends: [
                        c.preset,
                    ],
                    define: {},
                });

                for (const [key, value] of Object.entries(c.expected)) {
                    expect(env[key as keyof typeof env]).toBe(value);
                }
            });

            it("calls onValidationError with the missing key in the issues path", (): void => {
                const handler = vi.fn(
                    (issues: readonly StandardSchemaV1.Issue[]): never => {
                        throw new Error(`caught ${issues.length} issues`);
                    },
                );

                const runtimeEnv: Record<
                    string,
                    string | number | boolean | undefined
                > = {
                    ...c.runtimeEnv,
                };
                delete runtimeEnv[c.missingKey];

                expect((): void => {
                    createEnv({
                        target: c.target,
                        conditions: {
                            [c.target]: true,
                        },
                        runtimeEnv,
                        extends: [
                            c.preset,
                        ],
                        define: {},
                        onValidationError: handler,
                    });
                }).toThrow("caught 1 issues");

                const issues = handler.mock.calls[0]?.[0];
                expect(issues).toHaveLength(1);
                expect(issues?.[0]?.path?.[0]).toBe(c.missingKey);
            });

            it("rejects an invalid Rsbuild MODE value", (): void => {
                if (!("MODE" in c.runtimeEnv)) return;
                if (c.name.includes("vite")) return;

                const handler = vi.fn(
                    (issues: readonly StandardSchemaV1.Issue[]): never => {
                        throw new Error(`caught ${issues.length} issues`);
                    },
                );

                const runtimeEnv: Record<
                    string,
                    string | number | boolean | undefined
                > = {
                    ...c.runtimeEnv,
                    MODE: "staging",
                };

                expect((): void => {
                    createEnv({
                        target: c.target,
                        conditions: {
                            [c.target]: true,
                        },
                        runtimeEnv,
                        extends: [
                            c.preset,
                        ],
                        define: {},
                        onValidationError: handler,
                    });
                }).toThrow("caught 1 issues");

                const issues = handler.mock.calls[0]?.[0];
                expect(issues?.[0]?.path?.[0]).toBe("MODE");
            });
        });
    }
});

describe("nested extends", (): void => {
    const base = createExtension({
        define: {
            NODE_ENV: z.enum([
                "development",
                "production",
            ]),
        },
    });

    const mid = createExtension({
        extends: [
            base,
        ],
        define: {
            PORT: z.number(),
        },
    });

    const leaf = createExtension({
        extends: [
            mid,
        ],
        define: {
            API_URL: z.string().url(),
        },
    });

    it("validates keys contributed by every level of a nested chain", (): void => {
        const env = createEnv({
            target: "server",
            conditions: {
                server: true,
            },
            runtimeEnv: {
                NODE_ENV: "production",
                PORT: 3000,
                API_URL: "https://example.com",
            },
            extends: [
                leaf,
            ],
            define: {},
        });

        expect(env.NODE_ENV).toBe("production");
        expect(env.PORT).toBe(3000);
        expect(env.API_URL).toBe("https://example.com");
    });

    it("surfaces a missing key from a deep level in onValidationError", (): void => {
        const handler = vi.fn(
            (issues: readonly StandardSchemaV1.Issue[]): never => {
                throw new Error(`caught ${issues.length} issues`);
            },
        );

        expect((): void => {
            createEnv({
                target: "server",
                conditions: {
                    server: true,
                },
                runtimeEnv: {
                    NODE_ENV: "production",
                    PORT: 3000,
                },
                extends: [
                    leaf,
                ],
                define: {},
                onValidationError: handler,
            });
        }).toThrow("caught 1 issues");

        const issues = handler.mock.calls[0]?.[0];
        expect(issues).toHaveLength(1);
        expect(issues?.[0]?.path?.[0]).toBe("API_URL");
    });

    it("lets the outer define override a colliding key from an inner extension", (): void => {
        const inner = createExtension({
            define: {
                MODE: z.string(),
            },
        });

        const outer = createExtension({
            extends: [
                inner,
            ],
            define: {
                MODE: z.enum([
                    "production",
                    "development",
                    "none",
                ]),
            },
        });

        const env = createEnv({
            target: "client",
            conditions: {
                client: true,
            },
            runtimeEnv: {
                MODE: "none",
            },
            extends: [
                outer,
            ],
            define: {},
        });

        expect(env.MODE).toBe("none");

        const handler = vi.fn(
            (issues: readonly StandardSchemaV1.Issue[]): never => {
                throw new Error(`caught ${issues.length} issues`);
            },
        );

        expect((): void => {
            createEnv({
                target: "client",
                conditions: {
                    client: true,
                },
                runtimeEnv: {
                    MODE: "staging",
                },
                extends: [
                    outer,
                ],
                define: {},
                onValidationError: handler,
            });
        }).toThrow("caught 1 issues");

        const issues = handler.mock.calls[0]?.[0];
        expect(issues?.[0]?.path?.[0]).toBe("MODE");
    });

    it("flattens a chain of nested extends into a single merged define", (): void => {
        expect(leaf.define).toMatchObject({
            NODE_ENV: expect.any(Object),
            PORT: expect.any(Object),
            API_URL: expect.any(Object),
        });
        expect(Object.keys(leaf.define).sort()).toEqual(
            [
                "API_URL",
                "NODE_ENV",
                "PORT",
            ].sort(),
        );
    });
});
