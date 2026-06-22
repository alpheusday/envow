import { ClientComponent } from "#/components/client";
import { env } from "#/env/server";

const Page = (): React.JSX.Element => {
    return (
        <main>
            <h1>{env.MESSAGE}</h1>
            <ClientComponent />
        </main>
    );
};

export default Page;
