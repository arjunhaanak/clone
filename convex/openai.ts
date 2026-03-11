import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import OpenAI from "openai";

const getOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set in Convex environment variables.");
  }
  return new OpenAI({ apiKey });
};

export const generateAIResponse = action({
  args: {
    message: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant in a WhatsApp-like chat application." },
        { role: "user", content: args.message },
      ],
    });

    const aiContent = response.choices[0].message.content || "Sorry, I couldn't generate a response.";

    // Save the AI message (Need to find AI bot user or just use a system flag)
    await ctx.runMutation(api.messages.sendMessage, {
      conversationId: args.conversationId,
      content: aiContent,
      messageType: "text",
    });
  },
});
