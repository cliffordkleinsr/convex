// routes/blog.tsx
import { RouteSectionProps, useLocation } from "@solidjs/router";
import ConvexProvider from "~/components/solid-convex";
import { ConvexClient } from "convex/browser";
import { A } from "@solidjs/router";
import { JSX } from "solid-js";

const convex = new ConvexClient(import.meta.env.VITE_CONVEX_URL!);

export default function ExamplesLayout(props: RouteSectionProps) {
	const location = useLocation();
	function retstyles(pathname: string) {
		const anchorStyles: JSX.CSSProperties = {
			"text-decoration": location.pathname === pathname ? "underline" : "none",
		};
		return anchorStyles;
	}

	return (
		<ConvexProvider client={convex}>
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
				<A href="/" style={retstyles("/")}>
					Chat
				</A>
				<A href="/image" style={retstyles("/image")}>
					Upload
				</A>
				<A href="/signin" style={retstyles("/signin")}>
					Authentication
				</A>
			</nav>
			{props.children}
		</ConvexProvider>
	);
}
