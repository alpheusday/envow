import type { Target } from "#/@types/options";

/**
 * For each target, the set of detected conditions that satisfy it.
 *
 * A target is allowed when at least one of its allowed conditions
 * evaluates to true.
 *
 * - `server` is runtime-agnostic: it is satisfied on either a server or
 *   a client runtime.
 * - `client` is client-only: it is satisfied only on a client runtime.
 */
const TARGET_MAP: Readonly<Record<Target, readonly Target[]>> = {
    server: [
        "server",
        "client",
    ],
    client: [
        "client",
    ],
};

export { TARGET_MAP };
