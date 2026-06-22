import type { Extension } from "#/@types/extension";
import type {
    Conditions,
    EnvOutput,
    OnInvalidAccessContext,
    OnInvalidAccessContextTarget,
    Options,
    RuntimeEnv,
    Target,
} from "#/@types/options";
import type {
    StandardSchemaDictionary,
    StandardSchemaV1,
} from "#/@types/standard";

import { CONDITIONS_DEFAULT } from "#/constants/conditions";
import { TARGET_MAP } from "#/constants/target";
import { parseWithDictionary } from "#/functions/standard";

/**
 * Apply `emptyStringAsUndefined` without mutating the caller's object.
 */
const normalizeRuntimeEnv = (
    env: RuntimeEnv,
    emptyStringAsUndefined: boolean,
): RuntimeEnv => {
    if (!emptyStringAsUndefined) return env;

    const next: RuntimeEnv = {};

    for (const [key, value] of Object.entries(env)) {
        if (value === "") continue;
        next[key] = value;
    }

    return next;
};

/**
 * Resolve a condition value, calling it if it is a function.
 */
const resolveCondition = (value: boolean | (() => boolean)): boolean => {
    return typeof value === "function" ? value() : value;
};

/**
 * Detect the runtime target from the resolved conditions.
 */
const detectCurrentTarget = (conditions: Conditions): Target | "unknown" => {
    if (resolveCondition(conditions.client)) return "client";

    if (resolveCondition(conditions.server)) return "server";

    return "unknown";
};

const onInvalidAccessDefault = (ctx: OnInvalidAccessContext): never => {
    throw new Error(
        `Attempted to access \`${ctx.variable}\`, a ${ctx.target.expected} environment variable, on ${ctx.target.current}`,
    );
};

/**
 * Default validation error handler: logs the issues and throws.
 */
const onValidationErrorDefault = (
    issues: readonly StandardSchemaV1.Issue[],
): never => {
    const formatted: string = issues
        .map((issue: StandardSchemaV1.Issue): string => {
            const path: string =
                issue.path?.map((p) => String(p)).join(".") ?? "<root>";

            return `    - ${path}: ${issue.message}`;
        })
        .join("\n");

    console.error(`\nInvalid environment variables:\n${formatted}\n`);

    throw new Error(`Invalid environment variables`);
};

type ToReadOnlyProxyOptions<T extends Record<string, unknown>> = {
    value: T;
    onInvalidAccess: (ctx: OnInvalidAccessContext) => never;
    accessPolicy: (prop: string) => boolean;
    target: OnInvalidAccessContextTarget;
};

/**
 * Build a frozen, read-only proxy over the validated environment.
 */
const toReadOnlyProxy = <T extends Record<string, unknown>>({
    value,
    onInvalidAccess,
    accessPolicy,
    target,
}: ToReadOnlyProxyOptions<T>): Readonly<T> => {
    return new Proxy(value, {
        get(targetObj, prop) {
            if (typeof prop !== "string") return void 0;

            if (prop === "__esModule" || prop === "$$typeof") return void 0;

            if (!accessPolicy(prop)) {
                return onInvalidAccess({
                    target,
                    variable: prop,
                });
            }

            return Reflect.get(targetObj, prop);
        },
        set() {
            throw new Error(
                "Cannot assign to read-only property of environment object",
            );
        },
        defineProperty() {
            throw new Error(
                "Cannot define property on read-only environment object",
            );
        },
        deleteProperty() {
            throw new Error(
                "Cannot delete property of read-only environment object",
            );
        },
    }) as Readonly<T>;
};

const createEnv = <
    Define extends StandardSchemaDictionary,
    const Ext extends
        readonly Extension<StandardSchemaDictionary>[] = readonly [],
>(
    options: Options<Define, Ext>,
): EnvOutput<Define, Ext> => {
    const extensions: readonly Extension<StandardSchemaDictionary>[] =
        options.extends ?? [];

    const runtimeEnv: RuntimeEnv = options.runtimeEnv;

    const normalized: RuntimeEnv = normalizeRuntimeEnv(
        runtimeEnv,
        options.emptyStringAsUndefined ?? true,
    );

    const onInvalidAccess = options.onInvalidAccess ?? onInvalidAccessDefault;

    const conditions: Conditions = {
        ...CONDITIONS_DEFAULT,
        ...(options.conditions ?? {}),
    };

    const targetCurrent: Target | "unknown" = detectCurrentTarget(conditions);

    const accessTarget: OnInvalidAccessContextTarget = {
        expected: options.target,
        current: targetCurrent,
    };

    if (options.skipValidation ?? false) {
        return toReadOnlyProxy({
            value: normalized,
            onInvalidAccess,
            accessPolicy: (): boolean => true,
            target: accessTarget,
        }) as EnvOutput<Define, Ext>;
    }

    /**
     * Merge extension `define` dictionaries in array order, then the user's
     * `define` last so the user wins on key collision.
     */
    let define: StandardSchemaDictionary = options.define;

    if (extensions.length > 0) {
        const merged: Record<string, unknown> = {};

        for (const extension of extensions) {
            if (extension.define) {
                Object.assign(merged, extension.define);
            }
        }

        Object.assign(merged, options.define);

        define = merged as StandardSchemaDictionary;
    }

    const parsed = parseWithDictionary(define, normalized);

    const onValidationError =
        options.onValidationError ?? onValidationErrorDefault;

    if (parsed.issues) {
        return onValidationError(parsed.issues);
    }

    const allowed: readonly Target[] = TARGET_MAP[options.target];

    const isAllowedTarget: boolean = allowed.some((c: Target) =>
        resolveCondition(conditions[c]),
    );

    const accessPolicy: (prop: string) => boolean = (): boolean =>
        isAllowedTarget;

    return toReadOnlyProxy({
        value: parsed.value,
        onInvalidAccess,
        accessPolicy,
        target: accessTarget,
    }) as EnvOutput<Define, Ext>;
};

export { createEnv };
