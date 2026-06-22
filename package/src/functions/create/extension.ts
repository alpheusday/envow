import type { Format, Partial } from "ts-vista";

import type { Extension, MergedExtensionDefine } from "#/@types/extension";
import type { StandardSchemaDictionary } from "#/@types/standard";

/**
 * Recursively merge the `define` dictionaries of a tuple of extensions in
 * array order, then apply `ownDefine` last so the outer extension wins on key
 * collision.
 */
const flattenDefines = (
    extensions: readonly Extension<StandardSchemaDictionary>[],
    ownDefine: StandardSchemaDictionary,
    visited: Set<Extension<StandardSchemaDictionary>> = new Set(),
): StandardSchemaDictionary => {
    const merged: Record<string, unknown> = {};

    for (const extension of extensions) {
        if (visited.has(extension)) continue;

        visited.add(extension);

        if (extension.extends) {
            Object.assign(
                merged,
                flattenDefines(
                    extension.extends,
                    extension.define ?? {},
                    visited,
                ),
            );
        } else if (extension.define) {
            Object.assign(merged, extension.define);
        }
    }

    Object.assign(merged, ownDefine);

    return merged as StandardSchemaDictionary;
};

/** The complete options for an extension. */
type CompleteExtensionOptions<
    Define extends StandardSchemaDictionary,
    Ext extends readonly Extension<StandardSchemaDictionary>[],
> = {
    /** Inner extensions to merge. */
    extends: Ext;
    /** The env variable definitions. */
    define: Define;
};

/** Extension options with `extends`. */
type ExtensionOptions<
    Define extends StandardSchemaDictionary,
    Ext extends readonly Extension<StandardSchemaDictionary>[],
> = Format<Partial<CompleteExtensionOptions<Define, Ext>, "extends">>;

/**
 * Structural return type of `createExtension`.
 *
 * Identical in shape to `Extension<MergedExtensionDefine<Define, Ext>>` but
 * declared inline so that TypeScript does not re-check the
 * `StandardSchemaDictionary` constraint on the computed `MergedExtensionDefine`
 * at the generic declaration site.
 */
type FlattenedExtension<
    Define extends StandardSchemaDictionary,
    Ext extends
        readonly Extension<StandardSchemaDictionary>[] = readonly never[],
> = {
    define: MergedExtensionDefine<Define, Ext>;
};

/**
 * Create an extension that can be passed to `createEnv` via the `extends`
 * option.
 *
 * Nested `define`s are flattened in array order.
 * The outer `define` wins on key collision.
 *
 * ### Example
 *
 * ```ts
 * const base = createExtension({
 *     define: {
 *         NODE_ENV: z.enum(["development", "production"]),
 *     },
 * });
 *
 * const withPort = createExtension({
 *     extends: [base],
 *     define: {
 *         PORT: z.number(),
 *     },
 * });
 *
 * const env = createEnv({
 *     target: "server",
 *     runtimeEnv: process.env,
 *     extends: [
 *          withPort,
 *     ],
 *     define: {
 *         API_URL: z.string().url(),
 *     },
 * });
 * ```
 */
function createExtension<
    const Define extends StandardSchemaDictionary,
    const Ext extends
        readonly Extension<StandardSchemaDictionary>[] = readonly never[],
>(extension: ExtensionOptions<Define, Ext>): FlattenedExtension<Define, Ext>;

function createExtension(
    extension:
        | ExtensionOptions<
              StandardSchemaDictionary,
              readonly Extension<StandardSchemaDictionary>[]
          >
        | ExtensionOptions<StandardSchemaDictionary, readonly never[]>,
): FlattenedExtension<StandardSchemaDictionary> {
    const ownDefine: StandardSchemaDictionary = extension.define ?? {};

    const inner: readonly Extension<StandardSchemaDictionary>[] =
        extension.extends ?? [];

    const merged: StandardSchemaDictionary = flattenDefines(inner, ownDefine);

    return {
        define: merged,
    } as FlattenedExtension<StandardSchemaDictionary>;
}

export { createExtension };
