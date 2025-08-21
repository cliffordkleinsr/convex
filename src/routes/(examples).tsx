// routes/blog.tsx
import { type RouteSectionProps, useLocation } from "@solidjs/router";
import ConvexProvider from "~/components/solid-convex";
import { ConvexClient } from "convex/browser";
import NavBar from "~/components/NavBar";

const convex = new ConvexClient(import.meta.env.VITE_CONVEX_URL!);

export default function ExamplesLayout(props: RouteSectionProps) {
	return (
		<ConvexProvider client={convex}>
			<NavBar />
			{props.children}
		</ConvexProvider>
	);
}
