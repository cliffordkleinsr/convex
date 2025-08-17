// src/lib/convexHelper.ts
import type { betterAuth } from "better-auth";
import type { GenericActionCtx } from "convex/server";
import { createCookieGetter } from "better-auth/cookies";
import { JWT_COOKIE_NAME } from "@convex-dev/better-auth/plugins";
import { ConvexHttpClient, type ConvexClientOptions } from "convex/browser";
import { getRequestEvent } from "solid-js/web";
import { parseCookies } from "vinxi/http";

// SolidStart uses import.meta.env for env vars
const PUBLIC_CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
const PUBLIC_CONVEX_SITE_URL = import.meta.env.VITE_CONVEX_SITE_URL;

export const getToken = async (
	createAuth: (ctx: GenericActionCtx<any>) => ReturnType<typeof betterAuth>,
) => {
	const event = getRequestEvent();
	if (!event) throw new Error("getToken must be called during a request");
	const auth = createAuth({} as any);
	const createCookie = createCookieGetter(auth.options);
	const cookie = createCookie(JWT_COOKIE_NAME);

	const cookies = parseCookies(event.nativeEvent);
	const token = cookies[cookie.name];
	console.log(token);

	// Warn if there's a secure/insecure cookie mismatch like Next.js does
	if (!token) {
		const isSecure = cookie.name.startsWith("__Secure-");
		const insecureCookieName = cookie.name.replace("__Secure-", "");
		const insecureCookie = cookies[insecureCookieName];
		const secureCookieName = isSecure
			? cookie.name
			: `__Secure-${insecureCookieName}`;
		const secureCookie = cookies[secureCookieName];

		if (isSecure && insecureCookie) {
			console.warn(
				`Looking for secure cookie ${cookie.name} but found insecure cookie ${insecureCookieName}`,
			);
		}
		if (!isSecure && secureCookie) {
			console.warn(
				`Looking for insecure cookie ${cookie.name} but found secure cookie ${secureCookieName}`,
			);
		}
	}
	return token;
};

export const createConvexHttpClient = (args?: {
	options?: {
		skipConvexDeploymentUrlCheck?: boolean;
		logger?: ConvexClientOptions["logger"];
	};
}) => {
	const event = getRequestEvent();
	if (!event)
		throw new Error("createConvexHttpClient must be called during a request");

	const cookies = parseCookies(event.nativeEvent);
	const token = cookies["better-auth.convex_jwt"];

	const client = new ConvexHttpClient(PUBLIC_CONVEX_URL, args?.options);
	if (token) {
		client.setAuth(token);
	}
	return client;
};

const handler = async (request: Request, opts?: { convexSiteUrl?: string }) => {
	const requestUrl = new URL(request.url);
	const convexSiteUrl = opts?.convexSiteUrl ?? PUBLIC_CONVEX_SITE_URL;

	if (!convexSiteUrl) {
		throw new Error("VITE_PUBLIC_CONVEX_SITE_URL is not set");
	}

	const nextUrl = `${convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;
	const newRequest = new Request(nextUrl, request);
	newRequest.headers.set("accept-encoding", "application/json");

	return fetch(newRequest, { method: request.method, redirect: "manual" });
};

export const solidStartHandler = (opts?: { convexSiteUrl?: string }) => ({
	GET: (event: { request: Request }) => handler(event.request, opts),
	POST: (event: { request: Request }) => handler(event.request, opts),
});
