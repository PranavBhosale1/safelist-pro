// components/SellScriptDetailsModal.tsx
import { ExternalLink } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SellScript {
  id: string;
  company_name: string;
  logo_url: string;
  type: "ESOP" | "Shares";
  quantity: number;
  price: number;
  verified: boolean;
  forSale: boolean;
  seller_id: string;
  company_url?: string;
  doc_url: string; // Optional, if you want to track a document URL
}



export default function BuyScript({
  script,
  onClose,
}: {
  script: SellScript;
  onClose: () => void;
}) {
  const { data: session } = useSession();
  const currentUser = session.user.id;
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async (
  otherUserId: string,
  currentUserId: string,
  script: { id: string },
  router: AppRouterInstance,
  doc_url: string 
  
) => {
  // Prevent multiple submissions
  if (isConnecting) return;
  
  setIsConnecting(true);
  
  try {
    const scriptId = script.id;

    // Check for existing chat with same script and current user involved
    const { data: existing, error: fetchError } = await supabase
      .from("chats")
      .select("*")
      .or(`and(script_id.eq.${scriptId},user1_id.eq.${currentUserId}),and(script_id.eq.${scriptId},user2_id.eq.${currentUserId})`)
      .maybeSingle();

    if (fetchError) {
      console.error("Create chat error:", fetchError);
      toast.error("Error checking chat.");
      return;
    }

    if (existing) {
      toast("You're already connected. Opening chat...");
      router.push(`/chat/${script.id}`);
    } else {
      try {
        console.log("new chat creating")
        // Now create the chat
        const res = await fetch('/api/create-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user1_id: currentUserId,
            user2_id: otherUserId,
            script_id: scriptId,
            doc_url: doc_url, // Optional, if you want to track a document URL
          }),
        });

        const result = await res.json();

        if (!res.ok) {
          // If server suggests a redirect (insufficient credits), navigate the user to buy page.
          if (result?.redirect) {
            toast.error(result.error || 'Insufficient connections. Redirecting to purchase.');
            // navigate to buy page
            router.push(result.redirect);
            return;
          }

          // If chat creation failed for other reason, inform the user. Note: connection may already be decremented.
          toast.error(result.error || 'Something went wrong creating the chat');
          return;
        }

        toast.success('Connected! Opening chat...');
        router.push(`/chat/${script.id}`);
      } catch (err) {
        console.error('❌ API error:', err);
        toast.error('Failed to create chat.');
      }
    }
  } catch (error) {
    console.error("Connect error:", error);
    toast.error("Failed to connect.");
  } finally {
    setIsConnecting(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-xl relative border-2 border-green-300">
        <button
          onClick={ onClose }
          className="absolute top-2 right-3 text-gray-600 hover:text-green-600 text-2xl font-bold transition"
        >
          ×
        </button>

        {/* Company Card */}
        <div
          className="flex items-center gap-4 mb-6 bg-green-50 border-2 border-green-300 rounded-xl p-3 shadow-md cursor-pointer"
          onClick={() => {
            const params = new URLSearchParams({
              name: script.company_name,
              location: '', // script.location is not present
              rating: '',   // script.rating is not present
              url: script.company_url || '',
              logo: script.logo_url || '',
            }).toString();
            router.push(`/company_info?${params}`);
          }}
        >
          <img src={ script.logo_url } alt={ script.company_name } className="w-12 h-12 rounded-lg border-2 border-green-400 object-cover" />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{ script.company_name }</h2>
            <span className="text-xs bg-gradient-to-r from-green-600 to-green-700 text-white px-2 py-0.5 rounded shadow-sm">
              { script.type }
            </span>
          </div>
        </div>

        <div className="text-gray-700 text-sm space-y-1 mb-4">
          <p>Quantity: { script.quantity }</p>
          <p>Price: ₹{ script.price.toFixed(2) }</p>
          <p>Status: { "For Sale"}</p>
          <p>Verified: {"✅ Yes"}</p>
        </div>

        { script.company_url && (
          <a
            href={ script.company_url }
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:underline flex items-center gap-1 text-sm mb-4"
          >
            <ExternalLink className="w-4 h-4" /> Visit Company
          </a>
        ) }

        <div className="flex justify-end">
          <button
           onClick={() => handleConnect(script.seller_id, currentUser, script, router,script.doc_url)}
            disabled={isConnecting}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold shadow-md hover:scale-105 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isConnecting ? "Connecting..." : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
}
