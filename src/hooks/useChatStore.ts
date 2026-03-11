import { create } from "zustand";

interface ChatState {
  selectedConversation: any | null;
  setSelectedConversation: (conversation: any) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  selectedConversation: null,
  setSelectedConversation: (conversation) => set({ selectedConversation: conversation }),
}));
