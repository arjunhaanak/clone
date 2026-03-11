import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createStatus = mutation({
  args: {
    mediaUrl: v.string(),
    mediaType: v.union(v.literal("image"), v.literal("video"), v.literal("text")),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    return await ctx.db.insert("status", {
      userId: user._id,
      mediaUrl: args.mediaUrl,
      mediaType: args.mediaType,
      content: args.content,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
  },
});

export const getStatuses = query({
  handler: async (ctx) => {
    const now = Date.now();
    const statuses = await ctx.db
      .query("status")
      .filter((q) => q.gt(q.field("expiresAt"), now))
      .collect();

    const statusesWithUsers = await Promise.all(
      statuses.map(async (s) => {
        const user = await ctx.db.get(s.userId);
        return { ...s, user };
      })
    );

    return statusesWithUsers;
  },
});
