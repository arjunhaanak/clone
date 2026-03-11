"use client";

import { useState } from "react";
import { X, Users, Camera, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function CreateGroupModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const allUsers = useQuery(api.users.getUsers);
  const me = useQuery(api.users.getMe);
  const createConversation = useMutation(api.conversations.createConversation);

  const toggleUser = (user: any) => {
    if (selectedUsers.find((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreate = async () => {
    if (!groupName || selectedUsers.length === 0 || !me) return;

    await createConversation({
      participants: [...selectedUsers.map((u) => u._id), me._id],
      isGroup: true,
      groupName,
      groupImage: "https://cdn-icons-png.flaticon.com/512/166/166258.png",
    });
    onClose();
    setGroupName("");
    setSelectedUsers([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-[#111b21] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
      >
        <div className="p-6 bg-indigo-500 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6" />
            <h2 className="text-xl font-bold">New Group</h2>
          </div>
          <X className="w-6 h-6 cursor-pointer hover:rotate-90 transition-transform" onClick={onClose} />
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Group Subject"
              className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-800 focus:border-indigo-500 outline-none py-2 text-center text-lg dark:text-white transition-colors"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Add Participants</h3>
            <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2">
              {allUsers?.filter((u: any) => u._id !== me?._id).map((user: any) => (
                <div
                  key={user._id}
                  onClick={() => toggleUser(user)}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                    selectedUsers.find((u) => u._id === user._id)
                      ? "bg-indigo-500/10 border-indigo-500/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <img src={user.image} className="w-10 h-10 rounded-full object-cover" alt={user.name} />
                  <span className="flex-1 text-sm font-medium dark:text-gray-200">{user.name}</span>
                  {selectedUsers.find((u: any) => u._id === user._id) ? (
                    <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-200 dark:border-gray-700 rounded-full" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={!groupName || selectedUsers.length === 0}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20"
          >
            Create Group
          </button>
        </div>
      </motion.div>
    </div>
  );
}
