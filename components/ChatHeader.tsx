"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useSession } from "next-auth/react";

type User = {
  name: string;
  email: string;
};

export default function ChatHeader() {
  const { chatId } = useParams();
  const { data: session } = useSession();

  const [otherUser, setOtherUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchChatPartner = async () => {
      if (!session?.user?.id) return;

      console.log("Current user:", session.user.id);
      console.log("Chat ID:", chatId);

      const { data: chat, error: chatError } = await supabase
        .from("chats")
        .select("user1_id, user2_id")
        .eq("id", chatId)
        .single();

      if (chatError) {
        console.error("❌ Failed to fetch chat:", chatError);
        return;
      }

      const otherUserId =
        chat.user1_id === session.user.id ? chat.user2_id : chat.user1_id;

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("name, email") // Add 'avatar_url' if your table has it
        .eq("id", otherUserId)
        .single();

      if (userError) {
        console.error("❌ Failed to fetch user:", userError);
        return;
      }

      setOtherUser(user);
    };

    fetchChatPartner();
  }, [chatId, session?.user?.id]);

  if (!otherUser) return <div className="p-4">Loading chat...</div>;

  return (
    <div className="p-4 border-b-2 border-green-200 bg-white text-xl font-semibold text-gray-900">
      Chatting with: <span className="text-green-600">{otherUser.name}</span>
    </div>
  );
}
