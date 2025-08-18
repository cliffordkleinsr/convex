import {
	createContext,
	useContext,
	JSX,
	Accessor,
	createSignal,
	createEffect,
	onCleanup,
	createMemo,
} from "solid-js";
import ConvexProvider from "../solid-convex/index";
import { ConvexClient } from "convex/browser";

export type ConvexAuthState = {
	isLoading: Accessor<boolean>;
	isAuthenticated: Accessor<boolean>;
};

const ConvexAuthContext = createContext<ConvexAuthState>();

export function useConvexAuth(): ConvexAuthState {
	const ctx = useContext(ConvexAuthContext);
	if (!ctx) {
		throw new Error(
			"Could not find `ConvexProviderWithAuth`. Make sure it's wrapping your app.",
		);
	}
	return ctx;
}

export function ConvexProviderWithAuth(props: {
	children?: JSX.Element;
	client: ConvexClient;
	useAuth: () => {
		isLoading: boolean;
		isAuthenticated: boolean;
		fetchAccessToken: (args: {
			forceRefreshToken: boolean;
		}) => Promise<string | null>;
	};
}) {
	const { client } = props;

	// Get auth state reactively
	const authState = createMemo(() => props.useAuth());

	const [isConvexAuthenticated, setIsConvexAuthenticated] = createSignal<
		boolean | null
	>(null);

	// Reset Convex auth state when provider goes back to loading
	createEffect(() => {
		const auth = authState();
		if (auth.isLoading && isConvexAuthenticated() !== null) {
			setIsConvexAuthenticated(null);
		}
	});

	// Set Convex auth to false when provider is not authenticated
	createEffect(() => {
		const auth = authState();

		if (
			!auth.isLoading &&
			!auth.isAuthenticated &&
			isConvexAuthenticated() !== false
		) {
			setIsConvexAuthenticated(false);
		}
	});

	// Handle setting auth when provider reports authenticated
	createEffect(() => {
		const auth = authState();

		if (auth.isAuthenticated) {
			let isEffectActive = true;

			client.setAuth(auth.fetchAccessToken, (backendReportsIsAuthenticated) => {
				if (isEffectActive) {
					setIsConvexAuthenticated(backendReportsIsAuthenticated);
				}
			});

			onCleanup(() => {
				isEffectActive = false;
				// If unmounting or auth changed before we finished fetching the token
				// we shouldn't transition to a loaded state
				setIsConvexAuthenticated((prev) => (prev ? false : null));
			});
		}
	});

	function clearAuth(client: ConvexClient) {
		client.setAuth(
			async () => null,
			() => {},
		);
	}
	// Handle clearing auth - this should happen after other effects
	createEffect(() => {
		const auth = authState();

		if (auth.isAuthenticated) {
			onCleanup(() => {
				clearAuth(client);
				// Set state back to loading in case this is a transition from one
				// fetchToken function to another
				setIsConvexAuthenticated(null);
			});
		}
	});

	// Create reactive accessors for the context
	const isLoading = createMemo(() => isConvexAuthenticated() === null);
	const isAuthenticated = createMemo(
		() => authState().isAuthenticated && (isConvexAuthenticated() ?? false),
	);

	return (
		<ConvexAuthContext.Provider value={{ isLoading, isAuthenticated }}>
			<ConvexProvider client={client}>{props.children}</ConvexProvider>
		</ConvexAuthContext.Provider>
	);
}
