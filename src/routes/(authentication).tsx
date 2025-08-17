// routes/blog.tsx
import { RouteSectionProps } from "@solidjs/router";
import { ConvexClient } from "convex/browser";
import { ConvexBetterAuthProvider } from "~/components/auth-provider";
import { authClient } from "~/lib/auth-client";

const convex = new ConvexClient(import.meta.env.VITE_CONVEX_URL!);

export default function AuthLayout(props: RouteSectionProps) {
	return (
		<ConvexBetterAuthProvider client={convex} authClient={authClient}>
			{props.children}
		</ConvexBetterAuthProvider>
	);
}
