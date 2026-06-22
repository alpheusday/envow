import * as React from "react";
import { createRoot } from "react-dom/client";

import { env } from "./env";

const App = (): React.JSX.Element => {
    return (
        <main>
            <h1>{env.VITE_APP_TITLE}</h1>
            <p>
                {"API URL: "}
                {env.VITE_API_URL}
            </p>
        </main>
    );
};

const root: HTMLElement | null = document.getElementById("root");

if (!root) {
    throw new Error("Failed to find root element");
}

createRoot(root).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
