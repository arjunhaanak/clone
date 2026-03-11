import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/chat");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-4">
      <div className="max-w-2xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h1 className="text-6xl font-extrabold tracking-tight sm:text-7xl">
          WhatsApp <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-400">AI</span>
        </h1>
        <p className="text-xl text-indigo-100 sm:text-2xl">
          Premium messaging with AI smart replies, voice notes, and real-time encryption simulation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/chat"
            className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-full hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-xl"
          >
            Start Chatting
          </a>
        </div>
      </div>
      
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
        {[
          { title: "Real-time", desc: "Instant messages with Convex backend." },
          { title: "AI Assistant", desc: "Smart replies and chat summaries." },
          { title: "Secure", desc: "Simulated end-to-end encryption." }
        ].map((feature, i) => (
          <div key={i} className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-indigo-100">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
