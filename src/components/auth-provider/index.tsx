import type { ParentComponent } from "solid-js";
import { ConvexProviderWithAuth } from "./auth_state"; // Solid port
import {
	AuthProvider,
	useAuth,
	type ConvexAuthClient,
	type AuthClient,
} from "./client";
import type { ConvexClient } from "convex/browser";

export const ConvexBetterAuthProvider: ParentComponent<{
	client: ConvexClient;
	authClient: AuthClient;
}> = (props) => {
	// optional flags (mimicking React version)
	const convexAuthClient: ConvexAuthClient = {
		verbose: (props.client as any).options?.verbose,
		logger: undefined, // convex/browser doesn’t expose a logger
	};

	return (
		<AuthProvider
			client={props.client} // <-- actual ConvexClient instance
			convexAuthClient={convexAuthClient} // <-- meta flags
			authClient={props.authClient}
		>
			<ConvexProviderWithAuth client={props.client} useAuth={useAuth}>
				{props.children}
			</ConvexProviderWithAuth>
		</AuthProvider>
	);
};

// short-lived alias
export { ConvexBetterAuthProvider as ConvexProviderWithBetterAuth };
