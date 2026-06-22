import type { StandardSchemaV1 } from "@standard-schema/spec";

type StandardSchemaDictionary<
    Input = Record<string, unknown>,
    Output extends Record<keyof Input, unknown> = Input,
> = {
    [K in keyof Input]-?: StandardSchemaV1<Input[K], Output[K]>;
};

declare namespace StandardSchemaDictionary {
    type InferInput<T extends StandardSchemaDictionary> = {
        [K in keyof T]: StandardSchemaV1.InferInput<T[K]>;
    };
    type InferOutput<T extends StandardSchemaDictionary> = {
        [K in keyof T]: StandardSchemaV1.InferOutput<T[K]>;
    };
}

export type { StandardSchemaDictionary, StandardSchemaV1 };
