'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import FloatingChatButton from '@/components/FloatingChatButton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signup");
    }
  }, [status, router]);

  return (
    <div className="flex min-h-screen bg-white text-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="z-10 flex-1 flex flex-col ml-0 md:ml-64 transition-all">
        {children}
      </div>

      {/* Floating Chat Button */}
      <FloatingChatButton />
    </div>
  );
}

