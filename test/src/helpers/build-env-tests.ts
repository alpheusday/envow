import type { StandardSchemaV1 } from "@standard-schema/spec";
import type {
    EnvOutput,
    Extension,
    OnInvalidAccessContext,
    Options,
    Runtime,
    StandardSchemaDictionary,
    Target,
} from "envow";

import type { Schemas } from "#/__fixtures__/schemas";

import { createExtension } from "envow";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The runtime entry module shape returned by {@link BuildEnvTestsOptions.loadEntry}.
 */
type EnvEntry = {
    createEnv: <
        Define extends StandardSchemaDictionary,
        Ext extends
            readonly Extension<StandardSchemaDictionary>[] = readonly [],
    >(
        options: Options<Define, Ext>,
    ) => EnvOutput<Define, Ext>;
};

/**
 * Options for {@link buildEnvTests}.
 */
type BuildEnvTestsOptions = {
    runtime: Runtime;
    target: Target;
    schemas: Record<string, Schemas>;
    setupGlobal: () => void;
    loadEntry: () => Promise<EnvEntry>;
    teardownGlobal: () => void;
};

function buildEnvTests(opts: BuildEnvTestsOptions): void {
    const { runtime, target, schemas, setupGlobal, loadEntry, teardownGlobal } =
        opts;

    for (const [name, validator] of Object.entries(schemas)) {
        const { str, num, literal } = validator;

        describe(`${runtime} createEnv [${name}]`, (): void => {
            let entry: EnvEntry;

            beforeEach(async (): Promise<void> => {
                setupGlobal();
                vi.resetModules();
                entry = await loadEntry();
            });

            afterEach((): void => {
                teardownGlobal();
            });

            it("validates and returns typed env from explicit runtimeEnv", (): void => {
                const env = entry.createEnv({
                    target,
                    runtimeEnv: {
                        _TEST_VERSION: "1.0.0",
                    },
                    define: {
                        _TEST_VERSION: str({
                            min: 1,
                        }),
                    },
                });

                expect(env._TEST_VERSION).toBe("1.0.0");
            });

            it("infers the output type as readonly", (): void => {
                const env = entry.createEnv({
                    target,
                    runtimeEnv: {
                        _TEST_PORT: "3000",
                    },
                    define: {
                        _TEST_PORT: str(),
                    },
                });

                const _port: string = env._TEST_PORT;

                expect(_port).toBe("3000");
            });

            it("calls onValidationError with issues when a required var is missing", (): void => {
                const handler = vi.fn(
                    (issues: readonly StandardSchemaV1.Issue[]): never => {
                        throw new Error(`caught ${issues.length} issues`);
                    },
                );

                expect((): void => {
                    entry.createEnv({
                        target,
                        runtimeEnv: {},
                        define: {
                            _TEST_VERSION: str({
                                min: 1,
                            }),
                        },
                        onValidationError: handler,
                    });
                }).toThrow("caught 1 issues");

                expect(handler).toHaveBeenCalledOnce();
                const issues = handler.mock.calls[0]?.[0];
                expect(issues).toHaveLength(1);
                expect(issues?.[0]?.path?.[0]).toBe("_TEST_VERSION");
            });

            it("uses the default onValidationError (throws) when handler is omitted", (): void => {
                expect((): void => {
                    entry.createEnv({
                        target,
                        runtimeEnv: {},
                        define: {
                            _TEST_VERSION: str({
                                min: 1,
                            }),
                        },
                    });
                }).toThrow();
            });

            it("treats empty strings as undefined when emptyStringAsUndefined is true", (): void => {
                const handler = vi.fn(
                    (issues: readonly StandardSchemaV1.Issue[]): never => {
                        throw new Error(`caught ${issues.length} issues`);
                    },
                );

                expect((): void => {
                    entry.createEnv({
                        target,
                        runtimeEnv: {
                            _TEST_VERSION: "",
                        },
                        emptyStringAsUndefined: true,
                        define: {
                            _TEST_VERSION: str(),
                        },
                        onValidationError: handler,
                    });
                }).toThrow("caught 1 issues");
            });

            it("does not treat empty strings as undefined when emptyStringAsUndefined is false", (): void => {
                const env = entry.createEnv({
                    target,
                    runtimeEnv: {
                        _TEST_VERSION: "",
                    },
                    emptyStringAsUndefined: false,
                    define: {
                        _TEST_VERSION: str(),
                    },
                });

                expect(env._TEST_VERSION).toBe("");
            });

            it("skipValidation returns the raw runtimeEnv without validation", (): void => {
                const env = entry.createEnv({
                    target,
                    runtimeEnv: {
                        _TEST_VERSION: "not-validated",
                    },
                    skipValidation: true,
                    define: {
                        _TEST_VERSION: str({
                            min: 100,
                        }),
                    },
                });

                expect(env._TEST_VERSION).toBe("not-validated");
            });

            it("validates multiple keys independently", (): void => {
                const env = entry.createEnv({
                    target,
                    runtimeEnv: {
                        _TEST_VERSION: "1.2.3",
                        _TEST_PORT: "3000",
                        _TEST_MODE: "production",
                    },
                    define: {
                        _TEST_VERSION: str(),
                        _TEST_PORT: str(),
                        _TEST_MODE: literal("production"),
                    },
                });

                expect(env._TEST_VERSION).toBe("1.2.3");
                expect(env._TEST_PORT).toBe("3000");
                expect(env._TEST_MODE).toBe("production");
            });

            it("collects issues from all failing keys", (): void => {
                const handler = vi.fn(
                    (issues: readonly StandardSchemaV1.Issue[]): never => {
                        throw new Error(`${issues.length}`);
                    },
                );

                expect((): void => {
                    entry.createEnv({
                        target,
                        runtimeEnv: {
                            _TEST_VERSION: "x",
                        },
                        define: {
                            _TEST_VERSION: str({
                                min: 5,
                            }),
                            _TEST_PORT: num(),
                        },
                        onValidationError: handler,
                    });
                }).toThrow("2");

                const issues = handler.mock.calls[0]?.[0];
                expect(issues?.[0]?.path?.[0]).toBe("_TEST_VERSION");
                expect(issues?.[1]?.path?.[0]).toBe("_TEST_PORT");
            });

            it("is read-only: assigning a property throws", (): void => {
                const env = entry.createEnv({
                    target,
                    runtimeEnv: {
                        _TEST_VERSION: "1.0.0",
                    },
                    define: {
                        _TEST_VERSION: str(),
                    },
                });

                expect((): void => {
                    (
                        env as {
                            _TEST_VERSION: string;
                        }
                    )._TEST_VERSION = "hacked";
                }).toThrow();
            });

            it("does not leak __esModule or $$typeof through the proxy", (): void => {
                const env = entry.createEnv({
                    target,
                    runtimeEnv: {
                        _TEST_VERSION: "1.0.0",
                    },
                    define: {
                        _TEST_VERSION: str(),
                    },
                });

                expect("__esModule" in env).toBe(false);
                expect("$$typeof" in env).toBe(false);
            });

            it("throws on access when all allowed conditions for the target are false (function)", (): void => {
                const env = entry.createEnv({
                    target,
                    runtimeEnv: {
                        _TEST_VERSION: "1.0.0",
                    },
                    conditions: {
                        [target]: (): boolean => false,
                    },
                    define: {
                        _TEST_VERSION: str(),
                    },
                });

                expect((): void => {
                    void env._TEST_VERSION;
                }).toThrow("Attempted to access");
            });

            it("throws on access when all allowed conditions for the target are false (boolean)", (): void => {
                const env = entry.createEnv({
                    target,
                    runtimeEnv: {
                        _TEST_VERSION: "1.0.0",
                    },
                    conditions: {
                        [target]: false,
                    },
                    define: {
                        _TEST_VERSION: str(),
                    },
                });

                expect((): void => {
                    void env._TEST_VERSION;
                }).toThrow("Attempted to access");
            });

            it("onInvalidAccess receives the offending variable name and target context", (): void => {
                const handler = vi.fn((ctx: OnInvalidAccessContext): never => {
                    throw new Error(
                        `var=${ctx.variable} expected=${ctx.target.expected} current=${ctx.target.current}`,
                    );
                });

                const env = entry.createEnv({
                    target,
                    runtimeEnv: {
                        _TEST_VERSION: "1.0.0",
                    },
                    conditions: {
                        [target]: false,
                    },
                    define: {
                        _TEST_VERSION: str(),
                    },
                    onInvalidAccess: handler,
                });

                expect((): void => {
                    void env._TEST_VERSION;
                }).toThrow(`var=_TEST_VERSION expected=${target}`);

                expect(handler).toHaveBeenCalledOnce();
                expect(handler.mock.calls[0]?.[0]?.variable).toBe(
                    "_TEST_VERSION",
                );
                expect(handler.mock.calls[0]?.[0]?.target.expected).toBe(
                    target,
                );
            });

            it("validates normally when a custom condition for an allowed target is true", (): void => {
                const env = entry.createEnv({
                    target,
                    runtimeEnv: {
                        _TEST_VERSION: "1.0.0",
                    },
                    conditions: {
                        [target]: true,
                    },
                    define: {
                        _TEST_VERSION: str(),
                    },
                });

                expect(env._TEST_VERSION).toBe("1.0.0");
            });

            it("skipValidation bypasses a false condition without throwing", (): void => {
                const env = entry.createEnv({
                    target,
                    runtimeEnv: {
                        _TEST_VERSION: "not-validated",
                    },
                    conditions: {
                        [target]: (): boolean => false,
                    },
                    skipValidation: true,
                    define: {
                        _TEST_VERSION: str({
                            min: 100,
                        }),
                    },
                });

                expect(env._TEST_VERSION).toBe("not-validated");
            });

            if (target === "server") {
                it("throws on access when a client target is used on a server runtime", (): void => {
                    const env = entry.createEnv({
                        target: "client",
                        runtimeEnv: {
                            _TEST_VERSION: "1.0.0",
                        },
                        define: {
                            _TEST_VERSION: str(),
                        },
                    });

                    expect((): void => {
                        void env._TEST_VERSION;
                    }).toThrow("Attempted to access");
                });

                it("throws on access when a client target is used on a server runtime even with a false server condition override", (): void => {
                    const env = entry.createEnv({
                        target: "client",
                        runtimeEnv: {
                            _TEST_VERSION: "1.0.0",
                        },
                        conditions: {
                            server: (): boolean => true,
                        },
                        define: {
                            _TEST_VERSION: str(),
                        },
                    });

                    expect((): void => {
                        void env._TEST_VERSION;
                    }).toThrow("Attempted to access");
                });
            }

            if (target === "client") {
                it("allows a server target on a client runtime", (): void => {
                    const env = entry.createEnv({
                        target: "server",
                        runtimeEnv: {
                            _TEST_VERSION: "1.0.0",
                        },
                        define: {
                            _TEST_VERSION: str(),
                        },
                    });

                    expect(env._TEST_VERSION).toBe("1.0.0");
                });
            }

            describe("extends", (): void => {
                it("merges an extension's define and validates its keys", (): void => {
                    const base = createExtension({
                        define: {
                            _TEST_MODE: literal("production"),
                        },
                    });

                    const env = entry.createEnv({
                        target,
                        runtimeEnv: {
                            _TEST_VERSION: "1.0.0",
                            _TEST_MODE: "production",
                        },
                        extends: [
                            base,
                        ],
                        define: {
                            _TEST_VERSION: str(),
                        },
                    });

                    expect(env._TEST_VERSION).toBe("1.0.0");
                    expect(env._TEST_MODE).toBe("production");
                });

                it("user define wins on key collision", (): void => {
                    const base = createExtension({
                        define: {
                            _TEST_VERSION: literal("should-be-overridden"),
                        },
                    });

                    const env = entry.createEnv({
                        target,
                        runtimeEnv: {
                            _TEST_VERSION: "1.0.0",
                        },
                        extends: [
                            base,
                        ],
                        define: {
                            _TEST_VERSION: str(),
                        },
                    });

                    expect(env._TEST_VERSION).toBe("1.0.0");
                });

                it("later extension wins on collision among extensions", (): void => {
                    const a = createExtension({
                        define: {
                            _TEST_MODE: literal("a"),
                        },
                    });
                    const b = createExtension({
                        define: {
                            _TEST_MODE: literal("b"),
                        },
                    });

                    const env = entry.createEnv({
                        target,
                        runtimeEnv: {
                            _TEST_MODE: "b",
                        },
                        extends: [
                            a,
                            b,
                        ],
                        define: {},
                    });

                    expect(env._TEST_MODE).toBe("b");
                });

                it("reports issues for missing extension keys", (): void => {
                    const handler = vi.fn(
                        (issues: readonly StandardSchemaV1.Issue[]): never => {
                            throw new Error(`${issues.length}`);
                        },
                    );

                    const base = createExtension({
                        define: {
                            _TEST_MODE: literal("production"),
                        },
                    });

                    expect((): void => {
                        entry.createEnv({
                            target,
                            runtimeEnv: {},
                            extends: [
                                base,
                            ],
                            define: {},
                            onValidationError: handler,
                        });
                    }).toThrow("1");

                    const issues = handler.mock.calls[0]?.[0];
                    expect(issues?.[0]?.path?.[0]).toBe("_TEST_MODE");
                });

                it("skipValidation bypasses extension schemas", (): void => {
                    const base = createExtension({
                        define: {
                            _TEST_MODE: literal("production"),
                        },
                    });

                    const env = entry.createEnv({
                        target,
                        runtimeEnv: {
                            _TEST_MODE: "not-validated",
                        },
                        skipValidation: true,
                        extends: [
                            base,
                        ],
                        define: {},
                    });

                    expect(env._TEST_MODE).toBe("not-validated");
                });

                it("behaves identically when extends is omitted or empty", (): void => {
                    const envOmitted = entry.createEnv({
                        target,
                        runtimeEnv: {
                            _TEST_VERSION: "1.0.0",
                        },
                        define: {
                            _TEST_VERSION: str(),
                        },
                    });
                    const envEmpty = entry.createEnv({
                        target,
                        runtimeEnv: {
                            _TEST_VERSION: "1.0.0",
                        },
                        extends: [],
                        define: {
                            _TEST_VERSION: str(),
                        },
                    });

                    expect(envOmitted._TEST_VERSION).toBe("1.0.0");
                    expect(envEmpty._TEST_VERSION).toBe("1.0.0");
                });
            });
        });
    }
}

export type { BuildEnvTestsOptions, EnvEntry };
export { buildEnvTests };
