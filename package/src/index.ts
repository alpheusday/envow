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

export { createEnv } from "#/functions/create/env";
export { createExtension } from "#/functions/create/extension";
