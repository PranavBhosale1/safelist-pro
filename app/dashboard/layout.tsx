'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import FloatingChatButton from '@/components/FloatingChatButton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signup");
    }
  }, [status, router]);

  return (
    <div className="flex min-h-screen bg-white text-gray-900">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />

      {/* Main content */}
      <div
        className={`z-10 flex flex-1 flex-col transition-all duration-200 ease-in-out
        ${sidebarCollapsed ? 'ml-0 md:ml-20' : 'ml-0 md:ml-64'}`}
      >
        {children}
      </div>

      {/* Floating Chat Button */}
      <FloatingChatButton />
    </div>
  );
}

