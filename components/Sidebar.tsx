'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { X, Menu, ArrowLeft, LogOut } from 'lucide-react';
import NavItem from '@/components/NavItem';
import { useSession, signOut } from 'next-auth/react';

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleBack = () => {
    if (pathname === '/dashboard') {
      router.push('/');
    } else if (pathname.startsWith('/dashboard')) {
      router.push('/dashboard');
    } else if (pathname.startsWith('/chat')) {
      router.push('/dashboard');
    } else {
      router.back();
    }
  };

  const username = session?.user?.name ?? null;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-green-50 via-white to-green-50 w-64 p-6 space-y-6 fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r border-green-200 shadow-lg`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-700">
              SafeList
            </h2>
          </div>
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6 text-gray-700 hover:text-green-600 transition" />
          </button>
        </div>

        {/* Back Button */}
        <button
          onClick={handleBack}
          className="w-full px-4 py-3 rounded-xl text-left transition-all duration-200 font-medium text-gray-700 hover:bg-green-100 hover:text-green-700 flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Navigation */}
        <nav className="space-y-2">
          <NavItem label="Dashboard" href="/dashboard" />
          <NavItem label="Buy Connection" href="/dashboard/buy_connection" />
          <NavItem label="Documents" href="/dashboard/documents" />
          <NavItem label="Sell" href="/dashboard/sell" />
          <NavItem label="Buy" href="/dashboard/buy" />
        </nav>

        {/* User Info */}
        {session && (
          <div className="mt-auto pt-6 border-t border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-600 rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold uppercase text-white border-2 border-green-200">
                {username ? username.charAt(0) : 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">
                  {username ?? 'User'}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full px-4 py-2 rounded-xl text-left transition-all duration-200 font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg border border-green-200"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar menu"
      >
        <Menu className="w-6 h-6 text-gray-900" />
      </button>
    </>
  );
}

