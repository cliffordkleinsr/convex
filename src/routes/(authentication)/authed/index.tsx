import { createMutation, createQuery } from "~/components/solid-convex";
import { api } from "../../../../convex/_generated/api";
import { authClient } from "~/lib/auth-client";
import { useNavigate } from "@solidjs/router";

export default function Dash() {
	const user = createQuery(api.auth.getCurrentUser);
	const authed = createQuery(api.auth.isAuthenticated);
	const navigate = useNavigate();
	return (
		<>
			<pre>{JSON.stringify(user(), null, 2)}</pre>
			<pre>{JSON.stringify(authed(), null, 2)}</pre>
			<button
				onClick={async () => {
					await authClient.signOut();
					navigate("/signin", { replace: true });
				}}
			>
				logout
			</button>
		</>
	);
}
