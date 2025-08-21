import {
	type ParentComponent,
	createContext,
	useContext,
	createSignal,
	createEffect,
	createMemo,
	onMount,
} from "solid-js";
import { ConvexClient, type ConvexClientOptions } from "convex/browser";
import type { BetterAuthClientPlugin, ClientOptions } from "better-auth";
import type {
	crossDomainClient,
	convexClient,
} from "@convex-dev/better-auth/client/plugins";
import type { createAuthClient } from "better-auth/solid";
// Types
export type ConvexAuthClient = {
	verbose?: boolean;
	logger?: Exclude<NonNullable<ConvexClientOptions["logger"]>, boolean>;
};

type AuthContextValue = {
	isLoading: boolean;
	isAuthenticated: boolean;
	fetchAccessToken: (opts: {
		forceRefreshToken: boolean;
	}) => Promise<string | null>;
};
type CrossDomainClient = ReturnType<typeof crossDomainClient>;
type ConvexClientBetterAuth = ReturnType<typeof convexClient>;
type PluginsWithCrossDomain = (
	| CrossDomainClient
	| ConvexClientBetterAuth
	| BetterAuthClientPlugin
)[];
type PluginsWithoutCrossDomain = (
	| ConvexClientBetterAuth
	| BetterAuthClientPlugin
)[];
type AuthClientWithPlugins<
	Plugins extends PluginsWithCrossDomain | PluginsWithoutCrossDomain,
> = ReturnType<
	typeof createAuthClient<
		ClientOptions & {
			plugins: Plugins;
		}
	>
>;
export type AuthClient =
	| AuthClientWithPlugins<PluginsWithCrossDomain>
	| AuthClientWithPlugins<PluginsWithoutCrossDomain>;
// Context
const ConvexAuthInternalContext = createContext<AuthContextValue>();

export function useAuth() {
	const ctx = useContext(ConvexAuthInternalContext);
	if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
	return ctx;
}

export const AuthProvider: ParentComponent<{
	client?: ConvexClient; // allow injecting or creating internally
	convexAuthClient: ConvexAuthClient;
	authClient: AuthClient;
}> = (props) => {
	const client =
		props.client ?? new ConvexClient(import.meta.env.VITE_CONVEX_URL!);
	const { verbose, logger } = props.convexAuthClient;

	const logVerbose = (msg: string) => {
		if (verbose) {
			console.debug(`${new Date().toISOString()} ${msg}`);
			logger?.logVerbose(msg);
		}
	};

	// ---- STATE ----
	const sessionAccessor = props.authClient.useSession(); // Solid accessor
	const [isConvexAuthenticated, setIsConvexAuthenticated] = createSignal<
		boolean | null
	>(null);

	const isLoading = createMemo(() => sessionAccessor().isPending);
	const isAuthenticated = createMemo(
		() => sessionAccessor().data?.session !== null,
	);

	// ---- TOKEN FETCHER ----
	async function fetchAccessToken({
		forceRefreshToken,
	}: {
		forceRefreshToken: boolean;
	}) {
		if (forceRefreshToken) {
			const { data } = await props.authClient.convex.token();
			logVerbose("Returning freshly retrieved token");
			return data?.token ?? null;
		}
		return null;
	}

	// ---- EFFECTS ----

	// Keep Convex client in sync with BetterAuth session
	createEffect(() => {
		const session = sessionAccessor().data?.session;

		if (session && isConvexAuthenticated() === null) {
			logVerbose("Setting Convex client auth");
			client.setAuth(fetchAccessToken, (authed) => {
				setIsConvexAuthenticated(authed);
				logVerbose(`Convex client auth changed: ${authed}`);
			});
		}

		if (!session && isConvexAuthenticated() !== null) {
			logVerbose("Clearing Convex client auth");
			client.setAuth(
				async () => null,
				() => {},
			);
			setIsConvexAuthenticated(null);
		}
	});

	// One-time token (OTT) handling
	onMount(() => {
		(async () => {
			const url = new URL(window.location.href);
			const token = url.searchParams.get("ott");
			if (token) {
				const result = await (
					props.authClient as any
				).crossDomain.oneTimeToken.verify({ token });
				const session = result.data?.session;
				if (session) {
					await props.authClient.getSession({
						fetchOptions: {
							headers: { Authorization: `Bearer ${session.token}` },
						},
					});
					(props.authClient as any).updateSession();
				}
				url.searchParams.delete("ott");
				window.history.replaceState({}, "", url);
			}
		})().catch((err) => {
			console.error("onMount async task failed:", err);
		});
	});

	// ---- PROVIDE CONTEXT ----
	return (
		<ConvexAuthInternalContext.Provider
			value={{
				isLoading: isLoading(),
				isAuthenticated: isAuthenticated(),
				fetchAccessToken,
			}}
		>
			{props.children}
		</ConvexAuthInternalContext.Provider>
	);
};
