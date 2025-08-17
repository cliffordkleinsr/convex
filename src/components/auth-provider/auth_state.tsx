// src/lib/ConvexProviderWithAuth.tsx
import {
	createContext,
	useContext,
	JSX,
	Accessor,
	createSignal,
	createEffect,
	onCleanup,
	onMount,
} from "solid-js";
import ConvexProvider from "../solid-convex/index"; // <- convex Solid provider if available
import { ConvexClient } from "convex/browser";

export type ConvexAuthState = {
	isLoading: boolean;
	isAuthenticated: boolean;
};

const ConvexAuthContext = createContext<Accessor<ConvexAuthState>>();

export function useConvexAuth(): ConvexAuthState {
	const ctx = useContext(ConvexAuthContext);
	if (!ctx) {
		throw new Error(
			"Could not find `ConvexProviderWithAuth`. Make sure it's wrapping your app.",
		);
	}
	return ctx();
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
	const { client, useAuth } = props;
	const {
		isLoading: authProviderLoading,
		isAuthenticated: authProviderAuthenticated,
		fetchAccessToken,
	} = useAuth();

	const [isConvexAuthenticated, setIsConvexAuthenticated] = createSignal<
		boolean | null
	>(null);

	// keep auth state in sync with provider
	createEffect(() => {
		if (authProviderLoading && isConvexAuthenticated() !== null) {
			setIsConvexAuthenticated(null);
		}
		if (
			!authProviderLoading &&
			!authProviderAuthenticated &&
			isConvexAuthenticated() !== false
		) {
			setIsConvexAuthenticated(false);
		}
	});

	// First effect: setAuth when provider reports authenticated
	onMount(() => {
		if (authProviderAuthenticated) {
			let active = true;
			client.setAuth(fetchAccessToken, (backendReportsIsAuthenticated) => {
				if (active) setIsConvexAuthenticated(backendReportsIsAuthenticated);
			});

			onCleanup(() => {
				active = false;
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

	// Last effect: clearAuth when unmounting or auth changes
	createEffect(() => {
		if (authProviderAuthenticated) {
			onCleanup(() => {
				clearAuth(client);
				setIsConvexAuthenticated(null);
			});
		}
	});

	return (
		<ConvexAuthContext.Provider
			value={() => ({
				isLoading: isConvexAuthenticated() === null,
				isAuthenticated:
					authProviderAuthenticated && (isConvexAuthenticated() ?? false),
			})}
		>
			<ConvexProvider client={client as any}>{props.children}</ConvexProvider>
		</ConvexAuthContext.Provider>
	);
}
