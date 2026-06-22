import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { StrOptions } from "#/__fixtures__/schemas/@types";

import {
    literal as vLiteral,
    maxLength as vMaxLength,
    minLength as vMinLength,
    number as vNumber,
    pipe as vPipe,
    string as vString,
} from "valibot";

function str(options?: StrOptions): StandardSchemaV1<string, string> {
    if (options?.min !== undefined && options.max !== undefined) {
        return vPipe(
            vString(),
            vMinLength(options.min),
            vMaxLength(options.max),
        ) as StandardSchemaV1<string, string>;
    }
    if (options?.min !== undefined) {
        return vPipe(vString(), vMinLength(options.min)) as StandardSchemaV1<
            string,
            string
        >;
    }
    if (options?.max !== undefined) {
        return vPipe(vString(), vMaxLength(options.max)) as StandardSchemaV1<
            string,
            string
        >;
    }
    return vString() as StandardSchemaV1<string, string>;
}

function num(): StandardSchemaV1<number, number> {
    return vNumber() as StandardSchemaV1<number, number>;
}

function literal<T extends string>(expected: T): StandardSchemaV1<T, T> {
    return vLiteral(expected) as StandardSchemaV1<T, T>;
}

export { literal, num, str };
