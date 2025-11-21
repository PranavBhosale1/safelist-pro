import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useSession } from "next-auth/react";
import { useChatSocket, sendMessage } from "@/hooks/useChatSocket";
import SendDocumentDropdown from "@/components/SendDocumentDropdown";
import ChatInfo from "@/components/ChatInfo";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at?: string;
  // Add other fields as needed
};

interface ChatWindowProps {
  chatId: string;
  doc_url: string;
  scriptId: string;
}

export default function ChatWindow({ chatId, doc_url, scriptId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { data: session } = useSession();

  const [input, setInput] = useState("");

  // Format timestamp for display
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / 86400000);

    // Today - show time only
    if (diffInDays === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    // Yesterday
    if (diffInDays === 1) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}`;
    }
    
    // Within a week - show day and time
    if (diffInDays < 7) {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    // Older - show full date and time
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Fetch messages and subscribe to realtime updates
  useEffect(() => {
    if (!chatId || !session?.user?.id) return;

    let isMounted = true;
    setMessages([]); // Reset on chat switch

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (!error && isMounted) {
        setMessages(data || []);
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [chatId, session?.user?.id]);

  useChatSocket({
    chatId,
    onMessage: (msg) => setMessages((prev) => [...prev, msg]),
  });

  const handleSendMessage = () => {
    if (!input.trim()) {
      console.warn("⚠️ Empty message. Skipping send.");
      return;
    }
    if (!session?.user?.id) return;
    const messagePayload = {
      chat_id: chatId,
      sender_id: session.user.id,
      content: input.trim(),
    };

    sendMessage(messagePayload); // 🔁 use Socket.IO emit
    setInput(""); // ✅ Optimistically clear input
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg border-2 border-green-200 overflow-hidden relative">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-50">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center">No messages yet. Say hi 👋</p>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col mb-3 ${msg.sender_id === session?.user?.id ? 'items-end' : 'items-start'}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.25 }}
                  className={`max-w-[50%] break-words px-4 py-2 rounded-2xl shadow-md text-base relative
                    ${msg.sender_id === session?.user?.id
                      ? "bg-gradient-to-br from-green-600 to-green-700 text-white"
                      : "bg-green-50 text-gray-900 border-2 border-green-200"}
                  `}
                >
                  {msg.content}
                </motion.div>
                {msg.created_at && (
                  <span className={`text-xs mt-1 px-2 ${msg.sender_id === session?.user?.id ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formatTimestamp(msg.created_at)}
                  </span>
                )}
              </div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Document Sharing Dropdown (smooth transition) */}
      <div className="px-4 pb-2">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            key={doc_url}
          >
            <SendDocumentDropdown docUrl={`${doc_url}`} chatId={chatId} />
          </motion.div>
        </AnimatePresence>
      </div>
    
 <ChatInfo scriptId={scriptId} />
      

      {/* Input Bar (fixed at bottom) */}
      <div className="w-full px-4 py-3 bg-green-50 border-t-2 border-green-200 flex items-center gap-2 sticky bottom-0 z-10">
        <input
          className="flex-1 px-4 py-2 rounded-xl bg-white border-2 border-green-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 transition-all shadow-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
        />
        <button
          onClick={handleSendMessage}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-bold shadow-md hover:scale-105 transition-all"
        >
          Send
        </button>
      </div>
    </div>
  );
}
