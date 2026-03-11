"use client";

import { useState, useRef } from "react";
import { Mic, Square, Trash2, Send } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useChatStore } from "@/hooks/useChatStore";

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const { selectedConversation } = useChatStore();
  const sendMessage = useMutation(api.messages.sendMessage);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  const handleSend = async () => {
    if (!audioUrl || !selectedConversation) return;
    
    // In a real app, upload audioUrl (blob) to Convex/S3
    // For now, simulator: send a text saying [Voice Message]
    await sendMessage({
      conversationId: selectedConversation._id,
      content: "🎤 Voice Message",
      messageType: "voice",
    });
    setAudioUrl(null);
  };

  return (
    <div className="flex items-center gap-2">
      {isRecording ? (
        <div className="flex items-center gap-4 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full animate-pulse">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span className="text-xs text-red-600 font-medium">Recording...</span>
          <Square className="w-4 h-4 cursor-pointer text-red-600" onClick={stopRecording} />
        </div>
      ) : audioUrl ? (
        <div className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
          <audio src={audioUrl} controls className="h-6 w-32" />
          <Trash2 className="w-4 h-4 cursor-pointer text-gray-500" onClick={() => setAudioUrl(null)} />
          <Send className="w-4 h-4 cursor-pointer text-indigo-600" onClick={handleSend} />
        </div>
      ) : (
        <Mic className="w-6 h-6 cursor-pointer text-gray-500 hover:text-indigo-500 transition-colors" onClick={startRecording} />
      )}
    </div>
  );
}
