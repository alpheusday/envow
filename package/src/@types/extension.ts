import type { Format, Partial } from "ts-vista";

import type { StandardSchemaDictionary } from "#/@types/standard";

type CompleteExtension<Define extends StandardSchemaDictionary> = Readonly<{
    /** Inner extensions to merge. */
    extends: readonly Extension<StandardSchemaDictionary>[];
    /** The env variable definitions. */
    define: Define;
}>;

/** Environment variables extension. */
type Extension<Define extends StandardSchemaDictionary> = Format<
    Partial<CompleteExtension<Define>, "extends">
>;

/** Convert a union of object types into their intersection. */
type UnionToIntersection<U> = (
    U extends unknown
        ? (x: U) => void
        : never
) extends (x: infer I) => void
    ? I
    : never;

/**
 * Collapse a tuple of extensions to `Record<never, never>` when empty,
 * otherwise the intersection of `Mapper` applied to each element.
 */
type CollapseExt<
    Ext extends readonly Extension<StandardSchemaDictionary>[],
    Mapper,
> = [
    Ext,
] extends [
    readonly never[],
]
    ? Record<never, never>
    : UnionToIntersection<Mapper>;

/** Merge two dictionaries, with `A` winning on key collision. */
type MergeWinLeft<A, B> = {
    [K in keyof A | keyof B]: K extends keyof A
        ? A[K]
        : K extends keyof B
          ? B[K]
          : never;
};

/**
 * The `define` schemas of an extension,
 * collapsed to an empty record when broad.
 */
type ExtensionDefineSchemas<Ext extends Extension<StandardSchemaDictionary>> =
    string extends keyof NonNullable<Ext["define"]>
        ? Record<never, never>
        : NonNullable<Ext["define"]>;

/** The intersection of `define` schemas contributed by inner extensions. */
type ExtensionDefines<
    Ext extends readonly Extension<StandardSchemaDictionary>[],
> = CollapseExt<Ext, ExtensionDefineSchemas<Ext[number]>>;

/**
 * The flattened `define` after merging inner extensions
 * with the outer `define` applied last.
 */
type MergedExtensionDefine<
    Define extends StandardSchemaDictionary,
    Ext extends
        readonly Extension<StandardSchemaDictionary>[] = readonly never[],
> = MergeWinLeft<Define, ExtensionDefines<Ext>>;

/**
 * Extract the inferred output of an extension's `define`,
 * collapsed to an empty record when broad.
 */
type ExtensionDefineOutput<Ext extends Extension<StandardSchemaDictionary>> =
    NonNullable<Ext["define"]> extends StandardSchemaDictionary
        ? string extends keyof StandardSchemaDictionary.InferOutput<
              NonNullable<Ext["define"]>
          >
            ? Record<never, never>
            : StandardSchemaDictionary.InferOutput<NonNullable<Ext["define"]>>
        : Record<never, never>;

/** The inferred env output contributed by different extensions. */
type ExtensionOutputs<
    Ext extends readonly Extension<StandardSchemaDictionary>[],
> = CollapseExt<Ext, ExtensionDefineOutput<Ext[number]>>;

/** The merged output of user-defined variables and variables from extensions. */
type MergedEnvOutput<
    Define extends StandardSchemaDictionary,
    Ext extends readonly Extension<StandardSchemaDictionary>[],
> = MergeWinLeft<
    StandardSchemaDictionary.InferOutput<Define>,
    ExtensionOutputs<Ext>
>;

export type {
    Extension,
    ExtensionDefineOutput,
    ExtensionDefines,
    ExtensionOutputs,
    MergedEnvOutput,
    MergedExtensionDefine,
    UnionToIntersection,
};
