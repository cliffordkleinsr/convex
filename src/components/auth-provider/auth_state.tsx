import {
	createContext,
	useContext,
	type JSX,
	type Accessor,
	createSignal,
	createEffect,
	onCleanup,
	createMemo,
} from "solid-js";
import ConvexProvider from "../solid-convex/index";
import type { ConvexClient } from "convex/browser";

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
	const authState = createMemo(() => props.useAuth());
	const [isConvexAuthenticated, setIsConvexAuthenticated] = createSignal<
		boolean | null
	>(null);

	// Handle auth state changes
	createEffect(() => {
		const { isLoading, isAuthenticated } = authState();

		// Sync with auth provider state
		if (isLoading) {
			setIsConvexAuthenticated(null);
		} else if (!isAuthenticated) {
			setIsConvexAuthenticated(false);
		}
	});

	// Handle setting auth when provider reports authenticated
	createEffect(() => {
		const { isAuthenticated, fetchAccessToken } = authState();
		let cleanup: void | undefined | (() => void);
		let isActive = true;

		if (isAuthenticated) {
			cleanup = client.setAuth(fetchAccessToken, (authenticated) => {
				if (isActive) setIsConvexAuthenticated(authenticated);
			});
		}

		onCleanup(() => {
			isActive = false;
			cleanup?.();
			setIsConvexAuthenticated(null);
			clearAuth(client);
		});
	});
	function clearAuth(client: ConvexClient) {
		client.setAuth(
			async () => null,
			() => {},
		);
	}
	// Handle clearing auth - runs after other effects
	createEffect(() => {
		if (authState().isAuthenticated) {
			onCleanup(() => {
				clearAuth(client);
				setIsConvexAuthenticated(null);
			});
		}
	});

	// Create reactive accessors
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
