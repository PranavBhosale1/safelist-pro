'use client';


import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useSession } from 'next-auth/react';
import dynamic from "next/dynamic";

type Props = {
  docUrl: string;
  chatId: string;
};

export default function SendDocumentDropdown({ docUrl, chatId }: Props) {
  const [showDoc, setShowDoc] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [sharingActive, setSharingActive] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;
  const RestrictedViewer = dynamic(() => import("@/components/RestrictedViewer"), {
    ssr: false,
  });

  // Get permission (only seller can control share/unshare)
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user) return;

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: chatData } = await supabase
        .from('chats')
        .select('script_id')
        .eq('id', chatId)
        .single();

      if (!chatData?.script_id) return;

      const { data: scriptData } = await supabase
        .from('sell_script')
        .select('seller_id')
        .eq('id', chatData.script_id)
        .single();

      if (scriptData?.seller_id === user.id) {
        setCanShare(true);
      }
    };

    fetchPermissions();
  }, [chatId, user]);

  // Listen to real-time doc_shared changes
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel('realtime-doc-share')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chats',
          filter: `id=eq.${chatId}`,
        },
        (payload) => {
          const docShared = payload.new.doc_shared;
          setSharingActive(docShared);
          if (!docShared) setShowDoc(false); // auto close on stop
        }
      )
      .subscribe();

    // Initial fetch
    const fetchInitialSharing = async () => {
      const { data } = await supabase
        .from('chats')
        .select('doc_shared')
        .eq('id', chatId)
        .single();

      if (data) {
        setSharingActive(data.doc_shared);
      }
    };

    fetchInitialSharing();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  // Handle Share/Unshare
  const toggleShare = async (share: boolean) => {
    if (isToggling) return;
    setIsToggling(true);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { error } = await supabase
        .from('chats')
        .update({ doc_shared: share })
        .eq('id', chatId);

      if (error) {
        console.error("Toggle share error:", error);
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error("Toggle share error:", error);
      // You might want to show a toast notification here
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        { canShare && !sharingActive && (
          <button
            onClick={ () => toggleShare(true) }
            disabled={isToggling}
            className="px-4 py-2 rounded bg-gradient-to-r bg-green-600 text-white hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isToggling ? "Sharing..." : "Share Document"}
          </button>
        ) }

        { canShare && sharingActive && (
          <>
            <button
              onClick={ () => setShowDoc((prev) => !prev) }
              className="px-4 py-2 rounded bg-gradient-to-r bg-green-600 text-white hover:scale-105 transition"
            >
              { showDoc ? 'Hide Document' : 'Show Document' }
            </button>
            <button
              onClick={ () => toggleShare(false) }
              disabled={isToggling}
              className="px-4 py-2 rounded bg-gradient-to-r bg-green-600 text-white hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isToggling ? "Stopping..." : "Stop Sharing"}
            </button>
          </>
        ) }

        { !canShare && sharingActive && (
          <button
            onClick={ () => setShowDoc((prev) => !prev) }
            className="px-4 py-2 rounded bg-gradient-to-r bg-green-600 text-white hover:scale-105 transition"
          >
            { showDoc ? 'Hide Document' : 'Show Document' }
          </button>
        ) }
      </div>
      <div
        onContextMenu={ (e) => e.preventDefault() }
        onDragStart={ (e) => e.preventDefault() }
        onCopy={ (e) => e.preventDefault() }
        onCut={ (e) => e.preventDefault() }
        onPaste={ (e) => e.preventDefault() }
        className="select-none"
      >{ sharingActive && showDoc && <RestrictedViewer docUrl={ docUrl } /> }</div>

    </div>
  );
}
