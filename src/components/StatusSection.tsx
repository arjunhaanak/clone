"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Plus } from "lucide-react";

export default function StatusSection() {
  const statuses = useQuery(api.status.getStatuses);

  return (
    <div className="p-4 bg-white dark:bg-[#111b21] border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 overflow-x-auto no-scrollbar">
      {/* My Status */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer group">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-gray-300 dark:border-gray-700 p-0.5 group-hover:border-green-500 transition-colors">
            <img
              src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
              className="w-full h-full rounded-full object-cover grayscale opacity-50"
              alt="My Status"
            />
          </div>
          <div className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full p-0.5 border-2 border-white dark:border-[#111b21]">
            <Plus className="w-3 h-3" />
          </div>
        </div>
        <span className="text-[10px] text-gray-500 font-medium">My Status</span>
      </div>

      {/* Others Status */}
      {statuses?.map((s: any) => (
        <div key={s._id} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer">
          <div className="w-14 h-14 rounded-full border-2 border-green-500 p-0.5">
            <img
              src={s.user?.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              className="w-full h-full rounded-full object-cover"
              alt={s.user?.name}
            />
          </div>
          <span className="text-[10px] text-gray-500 font-medium truncate w-14 text-center">
            {s.user?.name}
          </span>
        </div>
      ))}
    </div>
  );
}
