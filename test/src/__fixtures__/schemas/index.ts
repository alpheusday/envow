import type { Schemas } from "#/__fixtures__/schemas/@types";

import * as arktype from "#/__fixtures__/schemas/arktype";
import * as valibot from "#/__fixtures__/schemas/valibot";
import * as zod from "#/__fixtures__/schemas/zod";

const schemas: Record<string, Schemas> = {
    arktype,
    valibot,
    zod,
};

export type { Schemas } from "#/__fixtures__/schemas/@types";

export { schemas };
