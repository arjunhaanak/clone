"use client";

import Sidebar from "@/components/Sidebar";
import SyncUser from "@/components/SyncUser";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-black">
      <SyncUser />
      <Sidebar />
      <main className="flex-1 h-full">
        {children}
      </main>
    </div>
  );
}
