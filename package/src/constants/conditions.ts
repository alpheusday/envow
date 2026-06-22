import type { Conditions } from "#/@types/options";

/**
 * Default environment detection conditions.
 */
const CONDITIONS_DEFAULT: Conditions = {
    client:
        typeof window !== "undefined" && typeof window.document !== "undefined",
    server: typeof window === "undefined",
};

export { CONDITIONS_DEFAULT };
