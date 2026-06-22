import type { StandardSchemaV1 } from "@standard-schema/spec";

type StrOptions = {
    min?: number;
    max?: number;
};

type Schemas = {
    str: (options?: StrOptions) => StandardSchemaV1<string, string>;
    num: () => StandardSchemaV1<number, number>;
    literal: <T extends string>(expected: T) => StandardSchemaV1<T, T>;
};

export type { Schemas, StrOptions };
