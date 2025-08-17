// routes/blog.tsx
import { RouteSectionProps } from "@solidjs/router";
import ConvexProvider from "~/components/solid-convex";
import { ConvexClient } from "convex/browser";

const convex = new ConvexClient(import.meta.env.VITE_CONVEX_URL!);

export default function ExamplesLayout(props: RouteSectionProps) {
	return <ConvexProvider client={convex}>{props.children}</ConvexProvider>;
}
