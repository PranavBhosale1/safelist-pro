import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// POST /api/connection
// Secure: read user from server session, validate the body, then upsert connections
export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id as string;
    const body = await req.json();
    const coinsToAdd = Number(body?.coinsToAdd ?? body?.count ?? 0);

    if (!Number.isFinite(coinsToAdd) || coinsToAdd <= 0) {
      return NextResponse.json({ error: 'Invalid coinsToAdd' }, { status: 400 });
    }

    // lookup existing row
    const { data: existing, error: fetchError } = await supabase
      .from('connections')
      .select('id, coins')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching connections:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (existing) {
      const newCoinValue = (existing.coins || 0) + coinsToAdd;
      const { data: updated, error: updateError } = await supabase
        .from('connections')
        .update({ coins: newCoinValue, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating connections:', updateError);
        return NextResponse.json({ error: 'Failed to update connections' }, { status: 500 });
      }

      return NextResponse.json({ success: true, coins: updated.coins });
    }

    // insert new row
    const { data: inserted, error: insertError } = await supabase
      .from('connections')
      .insert([{ user_id: userId, coins: coinsToAdd || 0 }])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting connections:', insertError);
      return NextResponse.json({ error: 'Failed to create connections' }, { status: 500 });
    }

    return NextResponse.json({ success: true, coins: inserted.coins });
  } catch (err: unknown) {
    console.error('Unexpected error in /api/connection POST', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message || 'Unexpected error' }, { status: 500 });
  }
}

// GET /api/connection
// Returns the current user's connections (coins) balance
export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id as string;

    const { data, error } = await supabase
      .from('connections')
      .select('coins')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error reading connections balance:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const coins = data?.coins ?? 0;
    return NextResponse.json({ success: true, coins });
  } catch (err: unknown) {
    console.error('Unexpected error in /api/connection GET', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message || 'Unexpected error' }, { status: 500 });
  }
}