'use client';

import { useRouter } from 'next/navigation';
import { MessageCircle } from "lucide-react";
import { cn } from "@/utils/cn";

export default function FloatingChatButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/chat/null`);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "fixed bottom-6 right-6 z-50 p-4 bg-green-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-green-700 hover:scale-110 transition-all duration-200"
      )}
      title="Open Chat"
    >
      <MessageCircle className="w-6 h-6" />
    </div>
  );
}







