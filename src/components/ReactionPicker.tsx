"use client";

import { Smile } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export default function ReactionPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Smile
        className="w-4 h-4 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
        onMouseEnter={() => setIsOpen(true)}
      />
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onMouseLeave={() => setIsOpen(false)}
            className="absolute bottom-full mb-2 bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 rounded-full flex gap-1 p-1 z-50"
          >
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onSelect(emoji);
                  setIsOpen(false);
                }}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded-full transition-all hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
