# Envow

A vow-driven env validation library.

## Installation

Install this package as a dependency in the project:

```sh
# npm
npm i envow

# Yarn
yarn add envow

# pnpm
pnpm add envow

# Deno
deno add npm:envow

# Bun
bun add envow
```

## Usage

`createEnv` validates the runtime environment against a [Standard Schema](https://github.com/standard-schema/standard-schema) dictionary and returns a read-only, typed object.

```ts
import { createEnv } from "envow";
import { z } from "zod";

const env = createEnv({
    target: "server",
    runtimeEnv: process.env,
    define: {
        MODE: z.enum(["development", "production"]),
        PORT: z.number(),
    },
});

env.PORT; // number
```

> `zod` is the user's own dependency (`pnpm add zod`). `envow` accepts any Standard Schema v1 validator (zod, valibot, arktype, ...).

## Extending env

`createExtension` builds a extension that can be composed into a `createEnv` call via the `extends` option. The parent call resolves `runtimeEnv` once and validates all keys (its own plus each extension's) in a single pass — extension code never touches the runtime environment.

```ts
import { createEnv, createExtension } from "envow";
import { z } from "zod";

const base = createExtension({
    define: {
        NODE_ENV: z.enum([
            "development",
            "test",
            "production",
        ]),
        LOG_LEVEL: z.enum([
            "debug",
            "info",
            "warn",
            "error",
        ]).default("info"),
    },
});

const env = createEnv({
    target: "server",
    runtimeEnv: process.env,
    extends: [
        base,
    ],
    define: {
        PORT: z.number(),
    },
});

env.NODE_ENV;  // "development" | "test" | "production"
env.LOG_LEVEL; // "debug" | "info" | "warn" | "error"
env.PORT;      // number
```

Extension `define` dictionaries are merged in array order; the user's `define` wins on key collision.

## Contributing

For contributing, please refer to the [contributing guide](./CONTRIBUTING.md).

## Credits

This project is inspired by [`t3-env`](https://github.com/t3-oss/t3-env) with the following differences:

- Extensions are schema-only; `runtimeEnv` is resolved alongside `createEnv`, not inside a extension.

- Flat `define` + `target`/`conditions` instead of `server`/`client`/`clientPrefix`.

- More composable while nestable extensions being merged in a single validation pass.

## License

This project is licensed under the terms of the MIT license.
