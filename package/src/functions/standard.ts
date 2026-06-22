import type {
    StandardSchemaDictionary,
    StandardSchemaV1,
} from "#/@types/standard";

function ensureSynchronous<T>(
    value: T | Promise<T>,
    message: string,
): asserts value is T {
    if (value instanceof Promise) {
        throw new Error(message);
    }
}

/**
 * Validate a record against a dictionary of Standard Schema validators.
 */
const parseWithDictionary = <TDict extends StandardSchemaDictionary>(
    dictionary: TDict,
    value: Record<string, unknown>,
): StandardSchemaV1.Result<StandardSchemaDictionary.InferOutput<TDict>> => {
    const result: Record<string, unknown> = {};

    const issues: StandardSchemaV1.Issue[] = [];

    for (const key in dictionary) {
        const schema = dictionary[key];

        if (!schema) continue;

        const propResult = schema["~standard"].validate(value[key]);

        ensureSynchronous(
            propResult,
            `Validation must be synchronous, but ${key} returned a Promise.`,
        );

        if (propResult.issues) {
            for (const issue of propResult.issues) {
                issues.push({
                    message: issue.message,
                    path: [
                        key,
                        ...(issue.path ?? []),
                    ],
                });
            }

            continue;
        }

        result[key] = propResult.value;
    }

    if (issues.length > 0) {
        return {
            issues,
        };
    }

    return {
        value: result as never,
    };
};

export { ensureSynchronous, parseWithDictionary };
