"use client";

import { env } from "#/env/client";

const ClientComponent = (): React.JSX.Element => {
    return (
        <section>
            <p>{env.NEXT_PUBLIC_APP_TITLE}</p>
            <p>
                {"API URL: "}
                {env.NEXT_PUBLIC_API_URL}
            </p>
        </section>
    );
};

export { ClientComponent };
