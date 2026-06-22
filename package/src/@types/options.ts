import type { Format, Omit, Partial } from "ts-vista";

import type { Extension, MergedEnvOutput } from "#/@types/extension";
import type {
    StandardSchemaDictionary,
    StandardSchemaV1,
} from "#/@types/standard";

/**
 * The target environment.
 */
type Target = "client" | "server";

/**
 * The fields to decide how the environment should be detected.
 *
 * By default:
 *
 * - `client` - `typeof window !== "undefined" && typeof window.document !== "undefined"`
 * - `server` - `typeof window === "undefined"`
 */
type Conditions = {
    [x in Target]: boolean | (() => boolean);
};

/**
 * The runtime.
 */
type Runtime = "node" | "deno" | "bun" | "cloudflare" | "browser";

/**
 * Runtime values.
 */
type RuntimeEnv = Record<string, string | number | boolean | undefined>;

type OnInvalidAccessContextTarget = {
    expected: Target;
    current: Target | "unknown";
};

type OnInvalidAccessContext = {
    target: OnInvalidAccessContextTarget;
    variable: string;
};

/**
 * The complete options for `createEnv`.
 */
type CompleteOptions<
    Define extends StandardSchemaDictionary,
    Ext extends readonly Extension<StandardSchemaDictionary>[] = readonly [],
> = {
    /**
     * The target environment for this call.
     */
    target: Target;

    /**
     * The fields to decide how the environment should be detected.
     */
    conditions: Conditions;

    /**
     * The object holding the environment variables at runtime.
     */
    runtimeEnv: RuntimeEnv;

    /**
     * Extensions to be merged.
     *
     * Each extension contributes a `define` dictionary that is merged in
     * array order before validation; the user's `define` wins on key
     * collision. The parent call resolves `runtimeEnv` once and validates
     * all keys in a single pass — extension code never touches the runtime
     * environment.
     */
    extends: Ext;

    /**
     * Treat empty strings as `undefined` before validation.
     *
     * Useful when a `.env` file produces `KEY=` entries that should fall back
     * to defaults or be flagged as missing rather than validated as `""`.
     *
     * By default, it is `true`.
     */
    emptyStringAsUndefined: boolean;

    /**
     * Skip validation and return the raw runtime environment.
     *
     * Escape hatch for build-time or CI contexts where the variables are not
     * present but the module must still load.
     *
     * By default, it is `false`.
     */
    skipValidation: boolean;

    /**
     * Called when validation fails.
     *
     * By default, the issues are binded to the error thrown.
     */
    onValidationError: (issues: readonly StandardSchemaV1.Issue[]) => never;

    /**
     * Called when attempted to access a non-supported environment variable.
     */
    onInvalidAccess: (context: OnInvalidAccessContext) => never;

    /**
     * The schema dictionary describing the environment variables to validate.
     *
     * Each value is a Standard Schema validator (zod, valibot, arktype etc).
     */
    define: Define;
};

/**
 * Options passed to `createEnv`.
 */
type Options<
    Define extends StandardSchemaDictionary,
    Ext extends readonly Extension<StandardSchemaDictionary>[] = readonly [],
> = Format<
    Partial<
        Omit<CompleteOptions<Define, Ext>, "conditions">,
        | "extends"
        | "emptyStringAsUndefined"
        | "skipValidation"
        | "onInvalidAccess"
        | "onValidationError"
    >
> & {
    /**
     * The fields to decide how the environment should be detected.
     */
    conditions?: Partial<Conditions>;
};

/**
 * The output type of `createEnv` for a given schema dictionary and extensions.
 */
type EnvOutput<
    Define extends StandardSchemaDictionary,
    Ext extends readonly Extension<StandardSchemaDictionary>[] = readonly [],
> = Readonly<MergedEnvOutput<Define, Ext>>;

export type {
    CompleteOptions,
    Conditions,
    EnvOutput,
    MergedEnvOutput,
    OnInvalidAccessContext,
    OnInvalidAccessContextTarget,
    Options,
    Runtime,
    RuntimeEnv,
    Target,
};
