import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { StrOptions } from "#/__fixtures__/schemas/@types";

import { literal as zLiteral, number as zNumber, string as zString } from "zod";

function str(options?: StrOptions): StandardSchemaV1<string, string> {
    const schema = zString();
    const withMin =
        options?.min !== undefined ? schema.min(options.min) : schema;
    const withMax =
        options?.max !== undefined ? withMin.max(options.max) : withMin;
    return withMax as StandardSchemaV1<string, string>;
}

function num(): StandardSchemaV1<number, number> {
    return zNumber() as StandardSchemaV1<number, number>;
}

function literal<T extends string>(expected: T): StandardSchemaV1<T, T> {
    return zLiteral(expected) as StandardSchemaV1<T, T>;
}

export { literal, num, str };
