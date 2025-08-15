import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	messages: defineTable({
		body: v.string(),
		user: v.string(),
	}),
	gallery: defineTable({
		storageId: v.id("_storage"),
		author: v.string(),
		format: v.literal("image"),
	}),
});
