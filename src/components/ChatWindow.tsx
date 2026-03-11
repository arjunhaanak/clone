"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Phone, Video, Search, MoreVertical, Smile, Paperclip, Send, Bot, Sparkles, MessageSquare } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useChatStore } from "@/hooks/useChatStore";
import { format } from "date-fns";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { encryptMessage, decryptMessage } from "@/lib/encryption";
import VoiceRecorder from "./VoiceRecorder";
import ReactionPicker from "./ReactionPicker";
import FileUploader from "./FileUploader";
import { motion, AnimatePresence } from "framer-motion";


export default function ChatWindow() {
  const me = useCurrentUser();
  const { selectedConversation } = useChatStore();
  const messages = useQuery(
    api.messages.getMessages,
    selectedConversation?._id ? { conversationId: selectedConversation._id } : "skip"
  );
  const sendMessage = useMutation(api.messages.sendMessage);
  const generateAIResponse = useAction(api.openai.generateAIResponse);
  
  const [content, setContent] = useState("");
  const [isTypingAI, setIsTypingAI] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] dark:bg-[#222e35] border-l border-gray-200 dark:border-gray-800">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
            <MessageSquare className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold dark:text-gray-100 tracking-tight">Select a Chat</h2>
          <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
            Choose a contact or group to start your encrypted conversation with AI capabilities.
          </p>
          <div className="pt-8 opacity-50">
            <Bot className="w-8 h-8 text-indigo-500 mx-auto animate-bounce" />
          </div>
        </motion.div>
      </div>
    );
  }

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content.trim()) return;

    const encrypted = encryptMessage(content.trim());
    await sendMessage({
      conversationId: selectedConversation._id,
      content: encrypted,
      messageType: "text",
    });
    setContent("");
  };

  const handleAskAI = async () => {
    if (!content.trim()) return;
    setIsTypingAI(true);
    const lastMsg = content.trim();
    setContent("");
    
    // First send user message
    await sendMessage({
      conversationId: selectedConversation._id,
      content: encryptMessage(lastMsg),
      messageType: "text",
    });

    try {
      await generateAIResponse({
        conversationId: selectedConversation._id,
        message: lastMsg,
      });
    } catch (e) {
      console.error("AI Error:", e);
    } finally {
      setIsTypingAI(false);
    }
  };

  const name = selectedConversation.isGroup ? selectedConversation.groupName : selectedConversation.otherUser?.name;
  const image = selectedConversation.isGroup ? selectedConversation.groupImage : selectedConversation.otherUser?.image;

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#efeae2] dark:bg-[#0b141a]">
      {/* Header */}
      <div className="p-3 flex justify-between items-center bg-[#f0f2f5] dark:bg-[#202c33] border-l border-gray-200 dark:border-gray-700 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              alt={name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50"
            />
            {!selectedConversation.isGroup && (
               <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#f0f2f5] dark:border-[#202c33] rounded-full" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm dark:text-gray-100">{name}</h3>
            <p className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              {selectedConversation.isGroup ? "Group members online" : "Online"}
            </p>
          </div>
        </div>
        <div className="flex gap-5 text-gray-600 dark:text-gray-400">
          <button className="hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-700 mt-2" />
          <button className="hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-opacity-10">
        <div className="flex justify-center my-4">
          <span className="bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-lg text-[10px] text-amber-800 dark:text-amber-200 uppercase tracking-widest shadow-sm border border-amber-200 dark:border-amber-800 font-medium">
            🔒 Messages are end-to-end encrypted
          </span>
        </div>
        
        <AnimatePresence>
          {messages?.map((msg) => {
            const isMe = msg.senderId === me?._id;
            const content = decryptMessage(msg.content);
            const isAI = msg.senderId === "ai_bot"; // or check some flag

            return (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={msg._id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-3.5 py-2 rounded-2xl shadow-sm text-sm relative group ${
                    isMe
                      ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-gray-100 rounded-tr-none"
                      : "bg-white dark:bg-[#202c33] text-gray-900 dark:text-gray-100 rounded-tl-none"
                  }`}
                >
                  {isAI && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Bot className="w-3 h-3 text-indigo-500" />
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tight">AI Generated</span>
                    </div>
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap">{content}</p>
                  
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ReactionPicker onSelect={(emoji) => console.log("Reacted with", emoji, "to", msg._id)} />
                  </div>

                  <div className="flex justify-end gap-1.5 mt-1 items-center">
                    <span className="text-[9px] text-gray-500/80 font-medium">
                      {format(msg._creationTime, "HH:mm")}
                    </span>
                    {isMe && (
                      <svg viewBox="0 0 16 11" width="14" height="11" fill="currentColor" className="text-blue-500">
                        <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-3.51-3.32a.365.365 0 0 0-.515.01l-.41.428a.333.333 0 0 0 .01.472l3.856 3.646c.124.118.318.118.441 0l6.015-7.38a.365.365 0 0 0-.063-.515zm-4.242 0l-.478-.372a.365.365 0 0 0-.51.063L4.925 9.879a.32.32 0 0 1-.484.033l-3.51-3.32a.365.365 0 0 0-.515.01l-.41.428a.333.333 0 0 0 .01.472l3.856 3.646c.124.118.318.118.441 0l6.015-7.38a.365.365 0 0 0-.063-.515z"/>
                      </svg>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isTypingAI && (
          <div className="flex justify-start">
             <div className="bg-white dark:bg-[#202c33] px-4 py-3 rounded-2xl rounded-tl-none shadow-sm text-sm">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-0" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-300" />
                </div>
             </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center gap-3 border-t border-gray-200 dark:border-gray-800">
        <div className="flex gap-2 text-gray-500 items-center">
          <Smile className="w-6 h-6 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors" />
          <FileUploader />
        </div>
        
        <form onSubmit={handleSend} className="flex-1 relative flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message"
            className="w-full bg-white dark:bg-[#2a3942] dark:text-gray-100 px-4 py-2.5 rounded-xl outline-none text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {content.trim() && (
             <motion.button
               type="button"
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={handleAskAI}
               className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
             >
               <Sparkles className="w-3.5 h-3.5" />
               ASK AI
             </motion.button>
          )}
        </form>

        <div className="flex items-center">
          {content.trim() ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
               onClick={() => handleSend()}
              className="bg-indigo-500 text-white p-2.5 rounded-full shadow-lg"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          ) : (
            <div className="flex items-center gap-3">
              <VoiceRecorder />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
