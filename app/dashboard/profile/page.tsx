'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, User, Mail, Coins, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coins, setCoins] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const username = session?.user?.name ?? null;
  const userEmail = session?.user?.email ?? null;
  const userId = session?.user?.id;

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/connection', { method: 'GET', credentials: 'same-origin' });
      const json = await res.json();
      if (res.ok && json?.coins != null) {
        setCoins(json.coins as number);
      } else {
        setCoins(0);
      }
    } catch (e) {
      console.error('Failed to fetch balance', e);
      setCoins(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchBalance();
    }
  }, [userId]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex-1 p-8 bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="w-full max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-48 bg-green-100 rounded-lg" />
            <div className="bg-white rounded-2xl shadow border border-green-200 p-8 space-y-4">
              <div className="h-32 w-32 bg-green-100 rounded-full mx-auto" />
              <div className="h-6 w-48 bg-green-100 rounded mx-auto" />
              <div className="h-4 w-64 bg-green-50 rounded mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-green-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-700">
            Profile
          </h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-md border border-green-200 p-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-green-600 rounded-full w-32 h-32 flex items-center justify-center text-4xl font-bold uppercase text-white border-4 border-green-200 shadow-lg mb-4">
              {username ? username.charAt(0) : 'U'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {username ?? 'User'}
            </h2>
            {userEmail && (
              <p className="text-sm text-gray-500">{userEmail}</p>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {/* Email Card */}
            {userEmail && (
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-5 h-5 text-green-600" />
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Email
                  </h3>
                </div>
                <p className="text-gray-900 font-medium break-all">{userEmail}</p>
              </div>
            )}

            {/* Connections Card */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <Coins className="w-5 h-5 text-green-600" />
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Available Connections
                </h3>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {coins == null ? '—' : coins}
              </p>
            </div>

            {/* User ID Card */}
            {userId && (
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-green-600" />
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    User ID
                  </h3>
                </div>
                <p className="text-gray-900 font-mono text-sm break-all">{userId}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


