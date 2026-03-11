import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(), // For Clerk auth
    lastSeen: v.optional(v.number()),
    onlineStatus: v.boolean(),
  }).index("by_token", ["tokenIdentifier"]),

  conversations: defineTable({
    participants: v.array(v.id("users")),
    isGroup: v.boolean(),
    groupName: v.optional(v.string()),
    groupImage: v.optional(v.string()),
    admin: v.optional(v.id("users")),
    lastMessage: v.optional(v.id("messages")),
  }),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("file"),
      v.literal("video"),
      v.literal("voice")
    ),
    messageStatus: v.union(v.literal("sent"), v.literal("delivered"), v.literal("read")),
  }).index("by_conversation", ["conversationId"]),

  status: defineTable({
    userId: v.id("users"),
    mediaUrl: v.string(),
    mediaType: v.union(v.literal("image"), v.literal("video"), v.literal("text")),
    content: v.optional(v.string()),
    expiresAt: v.number(),
  }).index("by_user", ["userId"]),

  reactions: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  }).index("by_message", ["messageId"]),
});
