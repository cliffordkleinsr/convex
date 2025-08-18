import { betterAuthComponent } from "./auth";
import { createAuth } from "../src/lib/auth";
import { query } from "./_generated/server";

// Example: using the getSession method in a Convex query

export const getSession = query({
	args: {},
	handler: async (ctx) => {
		const auth = createAuth(ctx);

		// For auth.api methods that require a session (such as
		// getSession()), you can use the getHeaders method to
		// get a headers object
		const headers = await betterAuthComponent.getHeaders(ctx);
		const session = await auth.api.getSession({
			headers,
		});
		if (!session) {
			return null;
		}
		// Do something with the session
		return session;
	},
});
