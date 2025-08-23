import { createQuery } from "~/components/solid-convex";
import { api } from "../../../../convex/_generated/api";
import { authClient } from "~/lib/auth-client";
import {
	action,
	createAsync,
	query,
	redirect,
	useAction,
} from "@solidjs/router";
import { createConvexHttpClient } from "~/lib/start";

const checkSession = query(async () => {
	"use server";
	const client = createConvexHttpClient();
	const data = await client.query(api.session.getSession, {});
	if (!data?.session) {
		throw redirect("/signin");
	}
	return data?.session;
}, "check_session");

const signOut = action(async () => {
	try {
		await authClient.signOut();
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		}
	}

	throw redirect("/signin");
}, "sign_out");

const deleteAccount = action(async () => {
	try {
		await authClient.deleteUser();
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		}
	}

	throw redirect("/bye");
}, "delete_my_account");

export const route = {
	preload: () => checkSession(),
};

export default function Dash() {
	const signOutAction = useAction(signOut);
	const deleteAction = useAction(deleteAccount);
	const session = createAsync(() => checkSession(), { deferStream: true }); // no delay
	const user = createQuery(api.auth.getCurrentUser); //client method ,notice the delay
	const authed = createQuery(api.auth.isAuthenticated); //client method ,notice the delay
	// const session = createQuery<any>(api.session.getSession) //client method of getting sess with convex

	return (
		<>
			<pre>User: {JSON.stringify(user(), null, 2)}</pre>
			<pre>Is Authenticated: {JSON.stringify(authed(), null, 2)}</pre>
			<pre>Server based Session: {JSON.stringify(session(), null, 2)}</pre>
			<button onClick={signOutAction}>logout</button>
			<br />
			<button onClick={deleteAction}>Delete My Account</button>
		</>
	);
}
