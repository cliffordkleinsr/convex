// routes/blog.tsx
import type { RouteSectionProps } from "@solidjs/router";
import ConvexProvider from "~/components/solid-convex";
import { ConvexClient } from "convex/browser";
import NavBar from "~/components/NavBar";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
	throw new Error("VITE_CONVEX_URL is not defined in the environment");
}

const convex = new ConvexClient(convexUrl);

export default function ExamplesLayout(props: RouteSectionProps) {
	return (
		<ConvexProvider client={convex}>
			<NavBar />
			{props.children}
		</ConvexProvider>
	);
}
