"use client";

import { useDropzone } from "react-dropzone";
import { Paperclip, X, FileIcon, ImageIcon } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useChatStore } from "@/hooks/useChatStore";

export default function FileUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const { selectedConversation } = useChatStore();
  const sendMessage = useMutation(api.messages.sendMessage);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedConversation) return;

    for (const file of files) {
      // Simulation: in real app, upload file to storage and get URL
      await sendMessage({
        conversationId: selectedConversation._id,
        content: `📁 Attachment: ${file.name}`,
        messageType: file.type.startsWith("image/") ? "image" : "file",
      });
    }
    setFiles([]);
  };

  return (
    <div className="relative">
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <Paperclip className="w-6 h-6 cursor-pointer text-gray-500 hover:text-indigo-500 transition-colors" />
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-full mb-4 left-0 w-64 bg-white dark:bg-[#2a3942] shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-800 p-4 z-50 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Files to send</h4>
              <X className="w-4 h-4 cursor-pointer text-gray-400" onClick={() => setFiles([])} />
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl group">
                  {file.type.startsWith("image/") ? (
                    <ImageIcon className="w-5 h-5 text-indigo-500" />
                  ) : (
                    <FileIcon className="w-5 h-5 text-blue-500" />
                  )}
                  <span className="text-[10px] text-gray-600 dark:text-gray-300 truncate flex-1">{file.name}</span>
                  <X className="w-3 h-3 cursor-pointer text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeFile(i)} />
                </div>
              ))}
            </div>

            <button
              onClick={handleUpload}
              className="w-full mt-4 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              Send {files.length} {files.length === 1 ? 'file' : 'files'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
