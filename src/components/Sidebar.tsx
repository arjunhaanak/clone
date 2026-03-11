"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Search, MoreVertical, Edit, MessageSquare, Plus } from "lucide-react";
import { useState } from "react";
import { useChatStore } from "@/hooks/useChatStore";
import { formatDistanceToNow } from "date-fns";
import StatusSection from "./StatusSection";
import { ThemeToggle } from "./ThemeToggle";
import CreateGroupModal from "./CreateGroupModal";
import { useNotifications } from "@/hooks/useNotifications";

export default function Sidebar() {
  const { user } = useUser();
  const { unreadCount, requestPermission } = useNotifications();
  const conversations = useQuery(api.conversations.getMyConversations);
  const allUsers = useQuery(api.users.getUsers);
  const createConversation = useMutation(api.conversations.createConversation);
  const me = useQuery(api.users.getMe);
  
  const { setSelectedConversation, selectedConversation } = useChatStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const filteredConversations = conversations?.filter((c: any) => {
    const name = c.isGroup ? c.groupName : c.otherUser?.name;
    return name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredUsers = allUsers?.filter((u: any) => {
    return (
      u._id !== me?._id &&
      u.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSelectUser = async (otherUser: any) => {
    if (!me) return;
    await createConversation({
      participants: [me._id, otherUser._id],
      isGroup: false,
    });
    setSearchTerm("");
    setIsSearchActive(false);
  };

  return (
    <div className="w-[400px] h-screen border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-[#111b21] relative">
      <CreateGroupModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} />
      
      {/* Header */}
      <div className="p-4 flex justify-between items-center bg-[#f0f2f5] dark:bg-[#202c33]">
        <div className="flex items-center gap-3">
          <img
            src={user?.imageUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:scale-105 transition-transform"
            onClick={requestPermission}
          />
          <div className="flex flex-col">
            <h1 className="font-semibold text-gray-800 dark:text-gray-100 hidden sm:block">Chats</h1>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full font-bold w-fit animate-pulse">
                {unreadCount} NEW
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-4 text-gray-600 dark:text-gray-400 items-center">
          <ThemeToggle />
          <Plus className="w-6 h-6 cursor-pointer hover:rotate-90 transition-transform" onClick={() => setIsGroupModalOpen(true)} />
          <MessageSquare className="w-6 h-6 cursor-pointer" />
          <MoreVertical className="w-6 h-6 cursor-pointer" />
        </div>
      </div>

      <StatusSection />

      {/* Search */}
      <div className="p-2">
        <div className="relative bg-[#f0f2f5] dark:bg-[#202c33] flex items-center px-4 py-2 rounded-lg">
          <Search className="w-5 h-5 text-gray-500 mr-3" />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="bg-transparent border-none outline-none w-full text-sm dark:text-white"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSearchActive(e.target.value.length > 0);
            }}
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isSearchActive ? (
          <div className="p-2 space-y-1">
            <h3 className="px-3 py-2 text-xs font-bold text-indigo-500 uppercase tracking-widest">Global Users</h3>
            {filteredUsers?.map((u: any) => (
              <div
                key={u._id}
                onClick={() => handleSelectUser(u)}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] rounded-xl transition-colors"
              >
                <img src={u.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} className="w-12 h-12 rounded-full object-cover" alt={u.name} />
                <div className="flex-1 border-b border-gray-100 dark:border-gray-800 py-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{u.name}</h3>
                  <p className="text-xs text-gray-500">Click to start conversation</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !conversations ? (
            <div className="p-4 text-center text-gray-500">Loading chats...</div>
          ) : filteredConversations?.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No chats found</div>
          ) : (
            filteredConversations?.map((conv: any) => {
              const isSelected = selectedConversation?._id === conv._id;
              const name = conv.isGroup ? conv.groupName : conv.otherUser?.name;
              const image = conv.isGroup ? conv.groupImage : conv.otherUser?.image;
              const lastMsg = conv.lastMessage?.content || "No messages yet";

              return (
                <div
                  key={conv._id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                    isSelected ? "bg-[#f0f2f5] dark:bg-[#2a3942]" : "hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]"
                  }`}
                >
                  <img
                    src={image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt={name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0 border-b border-gray-100 dark:border-gray-800 py-2">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {conv.lastMessage && formatDistanceToNow(conv.lastMessage._creationTime, { addSuffix: false })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{lastMsg}</p>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
}
