"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useNotifications() {
  const conversations = useQuery(api.conversations.getMyConversations);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!conversations) return;
    
    const count = (conversations as any[]).filter(c => c.lastMessage && c.lastMessage.senderId !== "me").length;
    setUnreadCount(count);

    if (count > 0 && typeof window !== "undefined" && Notification.permission === "granted") {
      new Notification("New Messages", {
        body: `You have ${count} unread conversations.`,
      });
    }
  }, [conversations]);

  const requestPermission = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission();
    }
  };

  return { unreadCount, requestPermission };
}
