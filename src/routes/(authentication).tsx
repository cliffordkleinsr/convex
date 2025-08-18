// routes/blog.tsx
import { RouteSectionProps } from "@solidjs/router";
import { ConvexClient } from "convex/browser";
import { Toaster } from "solid-sonner";
import { ConvexBetterAuthProvider } from "~/components/auth-provider";
import { authClient } from "~/lib/auth-client";
import { A } from "@solidjs/router";

const convex = new ConvexClient(import.meta.env.VITE_CONVEX_URL!);

export default function AuthLayout(props: RouteSectionProps) {
	return (
		<ConvexBetterAuthProvider client={convex} authClient={authClient}>
			<Toaster richColors />
			<nav
				style={{
					display: "flex",
					"column-gap": "8px",
					position: "fixed",
					top: 0,
					"z-index": 9,
					right: "2%",
					padding: "5ch 3ch",
				}}
			>
				<A href="/">Chat</A>
				<A href="/image">Upload</A>
				<A href="/signin">Authentication</A>
			</nav>
			{props.children}
		</ConvexBetterAuthProvider>
	);
}
