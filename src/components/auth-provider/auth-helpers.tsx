import { useConvexAuth } from "./auth_state";
import { ParentComponent, Show } from "solid-js";

/**
 * Renders children if the client is authenticated.
 *
 * @public
 */
export const Authenticated: ParentComponent = (props) => {
	const { isLoading, isAuthenticated } = useConvexAuth();

	return <Show when={!isLoading() && isAuthenticated()}>{props.children}</Show>;
};

/**
 * Renders children if the client is using authentication but is not authenticated.
 *
 * @public
 */
export const Unauthenticated: ParentComponent = (props) => {
	const { isLoading, isAuthenticated } = useConvexAuth();

	return (
		<Show when={!isLoading() && !isAuthenticated()}>{props.children}</Show>
	);
};

/**
 * Renders children if the client isn't using authentication or is in the process
 * of authenticating.
 *
 * @public
 */
export const AuthLoading: ParentComponent = (props) => {
	const { isLoading } = useConvexAuth();

	return <Show when={isLoading()}>{props.children}</Show>;
};
