// routes/blog.tsx
import type { RouteSectionProps } from "@solidjs/router";
import { ConvexClient } from "convex/browser";
import { Toaster } from "solid-sonner";
import { ConvexBetterAuthProvider } from "~/components/auth-provider";
import { authClient } from "~/lib/auth-client";
import NavBar from "~/components/NavBar";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
	throw new Error("VITE_CONVEX_URL is not defined in the environment");
}

const convex = new ConvexClient(convexUrl);

export default function AuthLayout(props: RouteSectionProps) {
	return (
		<ConvexBetterAuthProvider client={convex} authClient={authClient}>
			<Toaster richColors />
			<NavBar />
			{props.children}
		</ConvexBetterAuthProvider>
	);
}
