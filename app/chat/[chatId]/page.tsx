"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/utils/cn";
import { ArrowLeft } from 'lucide-react';

type Chat = {
  id: string;
  script_id: string;
  user1_id: string;
  user2_id: string;
  doc_url?: string;
  sell_script?: { title?: string };
  user1?: { id: string; name?: string };
  user2?: { id: string; name?: string };
  // add other fields as needed
};

export default function ChatLayout() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();

  const scriptIdFromUrl = Array.isArray(params?.chatId)
    ? params.chatId[0]
    : params?.chatId ?? null;

  const [matchedChat, setMatchedChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChatList, setShowChatList] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const userId = session?.user?.id;
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signup"); // or "/auth/signin"
    }
  }, [status, router]);
  // Fetch all chats for this user
  useEffect(() => {
    if (!userId) return;

    const fetchChats = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("chats")
        .select("*, sell_script(*), user1:user1_id(*), user2:user2_id(*)")
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`) // ✅ user involved
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("❌ Failed to load chats:", error);
        setLoading(false);
        return;
      }
      console.log(data);
      setChats(data || []);
      setMatchedChat(data[0] ?? null); // Only if you want to auto-select first
      setLoading(false);
    };

    fetchChats();
  }, [userId]);

  // Try to find matching chat using script_id from URL
  useEffect(() => {
    if (!userId || !scriptIdFromUrl || chats.length === 0) return;

    const existingChat = chats.find(
      (chat) =>
        chat.script_id === scriptIdFromUrl &&
        (chat.user1_id === userId || chat.user2_id === userId)
    );

    if (existingChat) {
      setMatchedChat(existingChat);
      return;
    }
    /*
    const createChat = async () => {
      try {
        const { data: script, error: scriptError } = await supabase
          .from("sell_script")
          .select("seller_id")
          .eq("id", scriptIdFromUrl)
          .single();

        if (scriptError || !script) {
          console.error("❌ Failed to fetch script:", scriptError?.message);
          return;
        }

        const sellerId = script.seller_id;
        const sorted = [userId, sellerId].sort();

        const { data: newChat, error: insertError } = await supabase
          .from("chats")
          .insert([
            {
              user1_id: sorted[0],
              user2_id: sorted[1],
              script_id: scriptIdFromUrl,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (insertError) {
          console.error("❌ Failed to insert chat:", insertError.message);
          return;
        }

        setMatchedChat(newChat);
      } catch (err) {
        console.error("❌ Chat creation error:", err);
      }
    };

    createChat();
    */
  }, [scriptIdFromUrl, chats, userId]);

  const handleChatClick = (chat: Chat) => {
    router.push(`/chat/${chat.script_id}`);
    setMatchedChat(chat);
    setShowChatList(false);
  };

  const handleBackToChatList = () => {
    setShowChatList(true);
    setMatchedChat(null);
    router.push('/chat/null');
  };

  return (
    <div className="flex min-h-screen bg-white text-gray-900">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />

      {/* Main content */}
      <div className={`z-10 flex-1 flex flex-col transition-all duration-200 ease-in-out ${sidebarCollapsed ? 'ml-0 md:ml-20' : 'ml-0 md:ml-64'}`}>
        <div className="flex h-screen overflow-hidden">
          {/* Left Sidebar */}
          <aside className={cn(
            "w-[360px] border-r  bg-emerald-600 p-6 overflow-y-auto rounded-tr-2xl rounded-br-2xl shadow-[0_0_24px_4px_#7c3aed20]",
            "md:block",
            showChatList ? "block" : "hidden"
          )}>
            <h2 className="text-2xl font-black mb-6 text-white tracking-tight">Chats</h2>
            {/* Search bar (UI only) */}
            <div className="mb-6">
              <input
                className="w-full px-4 py-2 rounded-lg bg-white border-2  text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition-all shadow-[0_0_8px_1px_#7c3aed10]"
                placeholder="Search chats..."
              />
            </div>
            {loading ? (
              <p className="text-sm text-white/50">Loading chats...</p>
            ) : chats.length === 0 ? (
              <p className="text-sm text-white/50">No chats yet</p>
            ) : (
              chats.map((chat) => {
                const otherUser =
                  chat.user1?.id === userId ? chat.user2 : chat.user1;
                const initials = (otherUser?.name || "U").slice(0, 2).toUpperCase();
                return (
                  <div
                    key={chat.id}
                    onClick={() => handleChatClick(chat)}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer mb-3 transition-all border border-transparent bg-emerald-600 hover:bg-green-700 hover:border-emerald-700 text-white"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br bg-green-300 flex items-center justify-center text-lg font-bold text-white shadow-[0_0_8px_1px_#7c3aed30]">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-white truncate">
                        {otherUser?.name || "User"}
                      </p>
                      <p className="text-xs text-white/50 truncate">
                        Script: {chat.sell_script?.title || chat.script_id}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </aside>

          {/* Right Chat Window */}
          <div className={cn(
            "flex-1 flex flex-col h-full min-h-0",
            "md:block",
            showChatList ? "hidden md:block" : "flex"
          )}>
            {/* Mobile Back Button */}
            {matchedChat && (
              <div className="md:hidden flex items-center gap-3 p-4 border-b  bg-black">
                <button
                  onClick={handleBackToChatList}
                  className="p-2 rounded-lg hover:bg-[#18122B] transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-white">
                    {matchedChat.user1?.id === userId ? matchedChat.user2?.name : matchedChat.user1?.name || "User"}
                  </p>
                  <p className="text-sm text-white/50">
                    Script: {matchedChat.sell_script?.title || matchedChat.script_id}
                  </p>
                </div>
              </div>
            )}
            {matchedChat ? (
              <ChatWindow
                chatId={matchedChat.id}
                doc_url={matchedChat.doc_url}
                scriptId={matchedChat.script_id}
              />
            ) : !scriptIdFromUrl || scriptIdFromUrl === "null" ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                👈 Select a chat to start messaging
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                ⚠️ No chat found for this script. You may need to connect first.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
