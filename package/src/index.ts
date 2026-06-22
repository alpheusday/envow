import type { Extension } from "#/@types/extension";
import type { EnvOutput, Options } from "#/@types/options";
import type { StandardSchemaDictionary } from "#/@types/standard";

import { createEnvCore } from "#/functions/create/env";

/**
 * Create a validated environment object.
 */
const createEnv = <
    Define extends StandardSchemaDictionary,
    const Ext extends
        readonly Extension<StandardSchemaDictionary>[] = readonly [],
>(
    options: Options<Define, Ext>,
): EnvOutput<Define, Ext> => {
    return createEnvCore({
        options,
    });
};

export type {
    Extension,
    ExtensionDefineOutput,
    ExtensionOutputs,
    UnionToIntersection,
} from "#/@types/extension";
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
} from "#/@types/options";
export type {
    StandardSchemaDictionary,
    StandardSchemaV1,
} from "#/@types/standard";

export { createExtension } from "#/functions/create/extension";
export { createEnv };
