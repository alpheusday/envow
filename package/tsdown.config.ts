import { defineConfig } from "@apst/tsdown";
import { cjsPreset, dtsPreset, esmPreset } from "@apst/tsdown/presets";

export default defineConfig(
    {
        entry: [
            "./src/index.ts",
            "./src/presets/*.ts",
        ],
        platform: "node",
        unbundle: true,
    },
    [
        cjsPreset(),
        esmPreset(),
        dtsPreset({
            presetOptions: {
                performanceMode: true,
            },
        }),
    ],
);
