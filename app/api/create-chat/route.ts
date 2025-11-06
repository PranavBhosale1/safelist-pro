// app/api/create-chat/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔐 Important: use service key in API route
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user1_id, user2_id, script_id, doc_url } = body;

    // Validate session and use session user as the initiator
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const initiator = session.user.id as string;

    // Determine the other user from payload
    const otherUser = user1_id === initiator ? user2_id : user2_id === initiator ? user1_id : null;
    if (!otherUser) {
      return NextResponse.json({ error: 'Invalid user ids: initiator must be one of user1_id or user2_id' }, { status: 400 });
    }

    // Ensure consistent ordering (sorted lexicographically)
    const sorted = [initiator, otherUser].sort();

    // Before creating chat, ensure initiator has at least 1 connection and decrement it
    const { data: connRow, error: connError } = await supabase
      .from('connections')
      .select('id, coins')
      .eq('user_id', initiator)
      .maybeSingle();

    if (connError) {
      console.error('Error fetching connections before creating chat:', connError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const currentCoins = connRow?.coins ?? 0;
    if (currentCoins < 1) {
      const redirectPath = '/dashboard/buy_connection';
      // Return a structured response with an explicit redirect path and header so
      // client code (fetch) can decide whether to navigate the browser.
      console.log("hhihih");
      return NextResponse.json(
        { error: 'Insufficient connections', redirect: redirectPath },
        { status: 402, headers: { 'x-redirect-to': redirectPath } }
      );
    }

    const { data: updatedConn, error: updateConnError } = await supabase
      .from('connections')
      .update({ coins: currentCoins - 1, updated_at: new Date().toISOString() })
      .eq('user_id', initiator)
      .select()
      .single();

    if (updateConnError) {
      console.error('Error decrementing connections:', updateConnError);
      return NextResponse.json({ error: 'Failed to decrement connections' }, { status: 500 });
    }

    // Create new chat
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('chats')
      .insert([
        {
          user1_id: sorted[0],
          user2_id: sorted[1],
          script_id: script_id,
          doc_url: doc_url,
          created_at: now,
          updated_at: now,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating chat:', error);
      return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Chat created', chat: data, coins: updatedConn.coins });
  } catch (err) {
    console.error('❌ Server error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
