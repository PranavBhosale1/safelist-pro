'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import SearchCompanyPage from "@/components/SearchCompany";
import UserShareList from "@/components/UserShareList";
import CompanyInfographic from "@/components/CompanyInfographic";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const username = session?.user?.name ?? null;
  const user = session?.user?.id;
  const [coins, setCoins] = useState<number | null>(null);

  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/connection", { method: "GET", credentials: "same-origin" });
      const json = await res.json();
      if (res.ok && json?.coins != null) setCoins(json.coins as number);
      else setCoins(0);
    } catch (e) {
      console.error("Failed to fetch balance", e);
      setCoins(0);
    }
  };

  useEffect(() => {
    if (user) fetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="backdrop-blur-sm bg-white/60 z-20 px-6 md:px-10 py-4 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold">Welcome back{username ? `, ${username.split(" ")[0]}` : ''} 👋</h1>
            <p className="text-sm text-gray-500">Overview of your investments, connections and activity</p>
          </div>
          <div className="md:hidden">
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block"><SearchCompanyPage /></div>

          {/* Dark Theme Toggle Button */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border-0 text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200 transition-colors shadow-md hover:shadow-lg"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </motion.button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/profile')}
              className="hidden md:flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <div className="bg-green-600 rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold uppercase text-white ring-2 ring-white">
                {username ? username.charAt(0) : 'U'}
              </div>
            </button>

            <div className="flex flex-col text-right hidden md:block">
              <span className="text-sm font-semibold text-gray-900">{username ?? 'User'}</span>
              <div className="text-xs text-right">
                <span className="text-xs text-gray-500">Connections: </span>
                <span className="text-xs text-green-600 font-medium">{coins == null ? '—' : coins}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero / Stats */}
      <main className="p-6 md:p-10 bg-gray-50">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="col-span-2 p-6 bg-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Get insights into your portfolio</h2>
                  <p className="text-gray-600 mt-1">Quick summary and recommended actions based on your recent activity.</p>
                  <div className="flex gap-3 mt-4">
                    <Button variant="primary" size="md" onClick={() => router.push('/dashboard/buy')}>Buy Connections</Button>
                    <Button variant="ghost" size="md" onClick={() => router.push('/dashboard/sell')}>Sell Scripts</Button>
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Available</div>
                    <div className="text-2xl font-bold text-green-600">{coins == null ? '—' : coins}</div>
                  </div>
                  <div className="hidden md:block border-l h-12" />
                  <div className="text-center pl-3">
                    <div className="text-sm text-gray-500">Scripts</div>
                    <div className="text-2xl font-bold">{/* placeholder */}12</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold text-gray-700">Quick Actions</h3>
                <div className="mt-3 flex flex-col gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/documents')}>My Documents</Button>
                  <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/profile')}>Account Settings</Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="col-span-1 border border-gray-100 bg-white p-0 hover:-translate-y-0 hover:shadow-sm lg:col-span-2">
              <CompanyInfographic
                className="p-6"
                title="Company insights"
                subtitle="Live data from Tracxn"
              />
            </Card>

            <Card className="border border-gray-100 bg-white p-0 hover:-translate-y-0 hover:shadow-sm">
              <UserShareList userId={session?.user.id} className="p-6" />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
