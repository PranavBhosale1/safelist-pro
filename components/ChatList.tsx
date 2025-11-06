// components/ChatList.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient"; // Adjust the import path as needed
import { useSession } from "next-auth/react";

export const ChatList = () => {
  const { data: session } = useSession();
    const currentUser = session?.user;
  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchChats = async () => {
      const { data } = await supabase
        .from("chats")
        .select("*")
        .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
        .order("created_at", { ascending: false });

      setChats(data || []);
    };

    fetchChats();
  }, [currentUser]);

  if (!currentUser) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Your Chats</h2>
      {chats.map((chat) => {
        const otherId =
          chat.user1_id === currentUser.id ? chat.user2_id : chat.user1_id;

        return (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div className="p-2 border rounded mb-2 hover:bg-gray-100 dark:hover:bg-gray-800">
              Chat with user: {otherId.slice(0, 6)}...
            </div>
          </Link>
        );
      })}
    </div>
  );
};
