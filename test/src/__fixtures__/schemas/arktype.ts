import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { StrOptions } from "#/__fixtures__/schemas/@types";

import { type as arkType } from "arktype";

function str(options?: StrOptions): StandardSchemaV1<string, string> {
    let schema = arkType.string;
    if (options?.min !== undefined) {
        schema = schema.atLeastLength(options.min);
    }
    if (options?.max !== undefined) {
        schema = schema.atMostLength(options.max);
    }
    return schema as StandardSchemaV1<string, string>;
}

function num(): StandardSchemaV1<number, number> {
    return arkType.number as StandardSchemaV1<number, number>;
}

function literal<T extends string>(expected: T): StandardSchemaV1<T, T> {
    return arkType(`"${expected}"` as never) as unknown as StandardSchemaV1<
        T,
        T
    >;
}

export { literal, num, str };
