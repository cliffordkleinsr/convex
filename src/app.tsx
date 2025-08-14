import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import ConvexProvider from "./components/solid-convex";
import { ConvexClient } from "convex/browser";

const convex = new ConvexClient(import.meta.env.VITE_CONVEX_URL!);
export default function App() {
	return (
		<Router
			root={(props) => (
				<MetaProvider>
					<ConvexProvider client={convex}>
						<Title>SolidStart - Basic</Title>
						<Suspense>{props.children}</Suspense>
					</ConvexProvider>
				</MetaProvider>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
