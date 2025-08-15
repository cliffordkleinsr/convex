import { api, internal } from "./_generated/api";
import {
	internalAction,
	internalMutation,
	mutation,
	query,
} from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
	args: {
		user: v.string(),
		body: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("messages", {
			user: args.user,
			body: args.body,
		});

		if (args.body.startsWith("/wiki")) {
			// Get the string after the first space
			const topic = args.body.slice(args.body.indexOf(" ") + 1);
			await ctx.scheduler.runAfter(0, internal.chat.getWikipediaSummary, {
				topic,
			});
		}
	},
});

export const getMessages = query({
	args: {},
	handler: async (ctx, args) => {
		// Get most recent messages first
		const messages = await ctx.db.query("messages").order("desc").take(50);
		// Reverse the list so that it's in a chronological order.
		return messages.reverse();
	},
});

export const getWikipediaSummary = internalAction({
	args: {
		topic: v.string(),
	},
	handler: async (ctx, args) => {
		const response = await fetch(
			`https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${args.topic}`,
		);
		const summary = getSummaryFromJSON(await response.json());
		await ctx.scheduler.runAfter(0, api.chat.sendMessage, {
			user: "Wikipedea",
			body: summary,
		});
	},
});

export const sendImage = mutation({
	args: {
		storageId: v.id("_storage"),
		author: v.string(),
	},
	handler: async function (ctx, args) {
		await ctx.db.insert("gallery", {
			storageId: args.storageId,
			author: args.author,
			format: "image",
		});
	},
});

export const generateUploadUrl = mutation({
	handler: async (ctx) => {
		return await ctx.storage.generateUploadUrl();
	},
});

export const fetchGallery = query({
	args: {},
	handler: async function (ctx, args) {
		const gallery = await ctx.db.query("gallery").collect();
		return Promise.all(
			gallery.map(async (image) => ({
				...image,
				url: await ctx.storage.getUrl(image.storageId),
			})),
		);
	},
});
function getSummaryFromJSON(data: any) {
	const firstPageId = Object.keys(data.query.pages)[0];
	return data.query.pages[firstPageId].extract;
}
