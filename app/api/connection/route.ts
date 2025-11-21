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

    // Validate Supabase configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn("⚠️ Supabase environment variables not configured");
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // lookup existing row
    const { data: existing, error: fetchError } = await supabase
      .from('connections')
      .select('id, coins')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      const errorMessage = fetchError.message || String(fetchError);
      // Check if it's a network/connection error
      if (errorMessage.includes('fetch failed') || errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
        console.error('Error fetching connections: Supabase connection failed. Check your Supabase URL and network connection.', {
          message: errorMessage,
          hint: "Verify NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file"
        });
        return NextResponse.json({ error: 'Database connection failed' }, { status: 503 });
      }
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
    const errorMessage = err instanceof Error ? err.message : String(err);
    if (errorMessage.includes('fetch failed') || errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
      console.error('Unexpected error in /api/connection POST: Network error', {
        message: errorMessage,
        hint: "Check your Supabase URL and network connection"
      });
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 });
    }
    console.error('Unexpected error in /api/connection POST', err);
    return NextResponse.json({ error: errorMessage || 'Unexpected error' }, { status: 500 });
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

    // Validate Supabase configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn("⚠️ Supabase environment variables not configured");
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { data, error } = await supabase
      .from('connections')
      .select('coins')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      const errorMessage = error.message || String(error);
      // Check if it's a network/connection error
      if (errorMessage.includes('fetch failed') || errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
        console.error('Error reading connections balance: Supabase connection failed. Check your Supabase URL and network connection.', {
          message: errorMessage,
          hint: "Verify NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file"
        });
        return NextResponse.json({ error: 'Database connection failed' }, { status: 503 });
      }
      console.error('Error reading connections balance:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const coins = data?.coins ?? 0;
    return NextResponse.json({ success: true, coins });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    if (errorMessage.includes('fetch failed') || errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
      console.error('Unexpected error in /api/connection GET: Network error', {
        message: errorMessage,
        hint: "Check your Supabase URL and network connection"
      });
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 });
    }
    console.error('Unexpected error in /api/connection GET', err);
    return NextResponse.json({ error: errorMessage || 'Unexpected error' }, { status: 500 });
  }
}