import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createConversation = mutation({
  args: {
    participants: v.array(v.id("users")),
    isGroup: v.boolean(),
    groupName: v.optional(v.string()),
    groupImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("conversations")
      .filter((q) =>
        q.and(
          q.eq(q.field("isGroup"), args.isGroup),
          // Simple check for 1-on-1 logic could be added here
        )
      )
      .collect();

    // Check if 1-on-1 already exists
    if (!args.isGroup && args.participants.length === 2) {
      const existingChat = existing.find((chat) =>
        chat.participants.every((p) => args.participants.includes(p))
      );
      if (existingChat) return existingChat._id;
    }

    return await ctx.db.insert("conversations", {
      participants: args.participants,
      isGroup: args.isGroup,
      groupName: args.groupName,
      groupImage: args.groupImage,
    });
  },
});

export const getMyConversations = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return [];

    const conversations = await ctx.db.query("conversations").collect();

    const myConversations = conversations.filter((c) => c.participants.includes(user._id));

    const conversationsWithDetails = await Promise.all(
      myConversations.map(async (conv) => {
        let otherUser = null;
        if (!conv.isGroup) {
          const otherUserId = conv.participants.find((p) => p !== user._id);
          if (otherUserId) {
            otherUser = await ctx.db.get(otherUserId);
          }
        }

        const lastMessage = conv.lastMessage ? await ctx.db.get(conv.lastMessage) : null;

        return {
          ...conv,
          otherUser,
          lastMessage,
        };
      })
    );

    return conversationsWithDetails;
  },
});
