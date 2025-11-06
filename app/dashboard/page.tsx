'use client';
import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SearchCompanyPage from '@/components/SearchCompany';
import UserShareList from '@/components/UserShareList';
import CompanyInfographic from '@/components/CompanyInfographic';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const username = session?.user?.name ?? null;
  const user = session?.user?.id;
  const [coins, setCoins] = useState<number | null>(null);

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/connection', { method: 'GET', credentials: 'same-origin' });
      const json = await res.json();
      if (res.ok && json?.coins != null) setCoins(json.coins as number);
      else setCoins(0);
    } catch (e) {
      console.error('Failed to fetch balance', e);
      setCoins(0);
    }
  };

  useEffect(() => {
    if (user) fetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
      {/* Top bar */}
      <header className="bg-white z-10 px-8 py-5 flex justify-between items-center shadow-sm border-b border-green-200">
        <div className="z-10 flex items-center gap-4">
          <SearchCompanyPage />
        </div>

        <div className="z-10 flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/profile')}
            className="hidden md:flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="bg-green-600 rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold uppercase text-white border-2 border-green-200">
              {username ? username.charAt(0) : 'U'}
            </div>
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-gray-900">{username ?? 'User'}</span>
              <div className="text-xs text-right">
                <span className="text-xs text-gray-500">Available connections: </span>
                <span className="text-xs text-green-600 font-medium">{coins == null ? '—' : coins}</span>
              </div>
            </div>
          </button>
        </div>
      </header>

      {/* Main content area */}
      <main className="z-0 flex-1 p-8 bg-gradient-to-br from-green-50 via-white to-green-50">
        {status === 'loading' ? (
          <div className="w-full max-w-7xl mx-auto space-y-8 animate-pulse">
            <div className="h-10 w-1/3 bg-green-100 rounded-lg mb-6" />
            <div className="flex gap-6">
              <div className="flex-1 h-40 bg-green-50 rounded-xl shadow-md border-2 border-green-200" />
              <div className="flex-1 h-40 bg-green-50 rounded-xl shadow-md border-2 border-green-200" />
              <div className="flex-1 h-40 bg-green-50 rounded-xl shadow-md border-2 border-green-200" />
            </div>
            <div className="h-64 w-full bg-green-50 rounded-xl border-2 border-green-200" />
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto space-y-8">
            {/* Company Infographic Section */}
            <div className="bg-white rounded-2xl shadow border border-green-200 p-8">
              <CompanyInfographic />
            </div>

            {/* User Shares Section */}
            <div className="bg-white rounded-2xl shadow border border-green-200 p-8">
              <UserShareList userId={session?.user.id} />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
