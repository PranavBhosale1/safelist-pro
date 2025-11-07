'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  X,
  Menu,
  ArrowLeft,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  FileText,
  ArrowRightCircle,
  ShoppingBag,
} from 'lucide-react';
import NavItem from '@/components/NavItem';
import { useSession, signOut } from 'next-auth/react';

type SidebarProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Buy Connection', href: '/dashboard/buy_connection', icon: ArrowRightCircle },
  { label: 'Documents', href: '/dashboard/documents', icon: FileText },
  { label: 'Sell', href: '/dashboard/sell', icon: ShoppingBag },
  { label: 'Buy', href: '/dashboard/buy', icon: ShoppingCart },
];

export default function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
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
    } else if (pathname.startsWith('/dashboard') || pathname.startsWith('/chat')) {
      router.push('/dashboard');
    } else {
      router.back();
    }
  };

  const username = session?.user?.name ?? null;
  const showLabels = !collapsed;

  const handleMouseEnter = () => {
    if (collapsed) {
      onCollapsedChange(false);
    }
  };

  const handleMouseLeave = () => {
    if (!collapsed) {
      onCollapsedChange(true);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`group/sidebar fixed inset-y-0 left-0 z-50 transform border-r border-gray-100 bg-white shadow-sm transition-[width,transform] duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${showLabels ? 'w-64' : 'w-20'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`${showLabels ? 'p-6 space-y-6' : 'px-4 py-6 space-y-4'} flex h-full flex-col transition-all duration-200`}>
          {/* Header */}
          <div className={`flex items-center ${showLabels ? 'justify-between pb-6' : 'justify-center pb-4'} border-b border-gray-100`}
          >
            <div className={`flex items-center ${showLabels ? 'gap-3' : 'justify-center'}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600">
                <span className="text-lg font-bold text-white">S</span>
              </div>
              {showLabels && <h2 className="text-2xl font-black text-gray-900">SafeList</h2>}
            </div>
            {showLabels && (
              <button
                className="md:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="h-6 w-6 text-gray-700 transition group-hover/sidebar:text-green-600" />
              </button>
            )}
          </div>

          {/* Back Button */}
          <button
            onClick={handleBack}
            className={`flex w-full items-center gap-2 rounded-xl transition-all duration-200 ${showLabels ? 'justify-start px-4 py-3 text-sm font-medium text-gray-700 hover:bg-green-100 hover:text-green-700' : 'justify-center p-3 text-gray-600 hover:bg-green-100'}`}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
            {showLabels && <span>Back</span>}
          </button>

          {/* Navigation */}
          <nav className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.href}
                label={item.label}
                href={item.href}
                icon={item.icon}
                showLabel={showLabels}
              />
            ))}
          </nav>

          {/* User Info */}
          {session && (
            <div className={`${showLabels ? 'mt-auto border-t border-green-200 pt-6' : 'mt-auto flex flex-col items-center gap-3 pt-4'}`}>
              <div className={`flex items-center ${showLabels ? 'gap-3' : 'flex-col gap-2'}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-green-200 bg-green-600 text-sm font-bold uppercase text-white">
                  {username ? username.charAt(0) : 'U'}
                </div>
                {showLabels && (
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">{username ?? 'User'}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className={`mt-3 flex w-full items-center gap-2 rounded-xl text-left text-sm font-medium transition-all duration-200 ${showLabels ? 'justify-start px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700' : 'justify-center p-2 text-gray-600 hover:bg-red-50 hover:text-red-700'}`}
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
                {showLabels && <span>Logout</span>}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        className="fixed left-4 top-4 z-40 rounded-lg border border-green-200 bg-white p-2 shadow-lg md:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar menu"
      >
        <Menu className="h-6 w-6 text-gray-900" />
      </button>
    </>
  );
}

