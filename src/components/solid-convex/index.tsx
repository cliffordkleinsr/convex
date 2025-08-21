import type { ConvexClient } from "convex/browser";
import type { FunctionReference } from "convex/server";
import {
	type Context,
	createContext,
	createEffect,
	createSignal,
	onCleanup,
	type ParentComponent,
	useContext,
} from "solid-js";

export const ConvexContext: Context<ConvexClient | undefined> = createContext();

// Create a reactive SolidJS atom attached to a Convex query function.
export function createQuery<T>(
	query: FunctionReference<"query">,
	args?: () => Record<string, unknown>, // args accepts an accessor instead of plain object for reactivity changes
): () => T | undefined {
	const convex = useContext(ConvexContext);
	if (convex === undefined) {
		throw "No convex context";
	}

	const [value, setValue] = createSignal<T | undefined>();

	createEffect(() => {
		// evaluate args reactively
		const fullArgs = args ? args() : {};
		const unsubber = convex.onUpdate(query, fullArgs, setValue);

		onCleanup(unsubber); // cleanup subscription when args change
	});

	return value;
}

export function createMutation<T>(
	mutation: FunctionReference<"mutation">,
): (args?: Record<string, unknown>) => Promise<T> {
	const convex = useContext(ConvexContext);
	if (convex === undefined) {
		throw "No convex context";
	}

	return (args) => {
		const fullArgs = args ?? {};
		return convex.mutation(mutation, fullArgs);
	};
}

export function createAction<T>(
	action: FunctionReference<"action">,
): (args?: Record<string, unknown>) => Promise<T> {
	const convex = useContext(ConvexContext);
	if (convex === undefined) {
		throw "No convex context";
	}
	return (args) => {
		const fullArgs = args ?? {};
		return convex.action(action, fullArgs);
	};
}

const ConvexProvider: ParentComponent<{
	client: ConvexClient | undefined;
}> = (props) => {
	return (
		<ConvexContext.Provider value={props.client}>
			{props.children}
		</ConvexContext.Provider>
	);
};

export default ConvexProvider;
