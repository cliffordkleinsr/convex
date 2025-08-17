import { createQuery } from "~/components/solid-convex";
import { api } from "../../../../convex/_generated/api";
import { authClient } from "~/lib/auth-client";

export default function Dash() {
    const user = createQuery(api.auth.getCurrentUser);
    return (
        <>
            {/* <p>Hello {user()?.name}!</p> */}
            <button onClick={() => authClient.signOut()}>logout</button>
        </>
    )
}