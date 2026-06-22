import type { Metadata } from "next";
import type * as React from "react";

export const metadata: Metadata = {
    title: "Next.js Example",
};

export default ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>): React.JSX.Element => {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
};
