"use client";

import { useCallback, useEffect, useState } from "react";
import { ShareInfoCard } from "@/components/ShareInfoCard";
import SellScriptModal from "@/components/SellScriptModal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";

interface ShareData {
  id: string;
  company_name: string;
  image_url: string;
  type: "ESOP" | "Shares";
  quantity: number;
  doc_url: string; // Optional, if you want to track a document URL
}

interface Props {
  userId: string;
  onAfterSell?: () => void;
  className?: string;
}

export default function UserShareList({ userId, onAfterSell, className }: Props) {
  const [shares, setShares] = useState<ShareData[]>([]);
  const [filter, setFilter] = useState<'all' | 'ESOP' | 'Shares'>('all');
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedShare, setSelectedShare] = useState<ShareData | null>(null);
  const router = useRouter();
  const sectionClasses = cn('space-y-6', className);
  const filterOptions: Array<{ label: string; value: typeof filter }> = [
    { label: 'All', value: 'all' },
    { label: 'ESOP', value: 'ESOP' },
    { label: 'Shares', value: 'Shares' },
  ];

  const counts = shares.reduce(
    (acc, share) => {
      acc.all += 1;
      if (share.type === 'ESOP') acc.ESOP += 1;
      if (share.type === 'Shares') acc.Shares += 1;
      return acc;
    },
    { all: 0, ESOP: 0, Shares: 0 }
  );

  const fetchShares = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/user-shares?userId=${userId}`);
      const json = await res.json();
      const safeData = Array.isArray(json) ? json : json.data || [];
      setShares(safeData);
    } catch (error) {
      console.error("Failed to fetch user shares:", error);
      setShares([]);
    }
  }, [userId]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  const handleSell = (share: ShareData) => {
    setSelectedShare(share);
    setSellModalOpen(true);
  };

  const handleBuy = (share: ShareData) => {
    router.push(`/dashboard/buy?name=${encodeURIComponent(share.company_name)}`);
  };

  const handleSellSuccess = () => {
    fetchShares();
    onAfterSell?.();
  };

  const filteredShares = shares.filter((share) =>
    filter === 'all' ? true : share.type === filter
  );

  return (
    <section className={sectionClasses}>
      <div className="flex flex-col gap-4 rounded-2xl border border-transparent bg-white/70 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900">Your listed shares</h2>
          <p className="text-sm text-gray-500">Keep tabs on scripts you have on the market.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-full bg-gray-50 p-1">
          {filterOptions.map(({ label, value }) => {
            const active = filter === value;
            const countLabel = counts[value];
            return (
              <Button
                key={value}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFilter(value)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium text-gray-600',
                  active
                    ? 'bg-white text-green-700 shadow-sm ring-1 ring-inset ring-green-200'
                    : 'hover:bg-white hover:text-gray-900'
                )}
              >
                <span>{label}</span>
                <span
                  className={cn(
                    'ml-2 inline-flex min-w-[1.75rem] items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-semibold',
                    active ? 'bg-green-100 text-green-700' : 'text-gray-500'
                  )}
                >
                  {countLabel}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {filteredShares.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white/80 p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No shares listed yet</h3>
          <p className="mt-2 text-sm text-gray-500">List your first share to start receiving offers.</p>
          <div className="mt-6 flex justify-center">
            <Button variant="primary" size="sm" onClick={() => router.push('/dashboard/documents')}>
              List your first share
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1">
          {filteredShares.map((share) => (
            <ShareInfoCard
              key={share.id}
              share={share}
              onSell={handleSell}
              onBuy={handleBuy}
            />
          ))}
        </div>
      )}

      {selectedShare && (
        <SellScriptModal
          open={sellModalOpen}
          onClose={() => setSellModalOpen(false)}
          share={selectedShare}
          sellerId={userId}
          onSuccess={handleSellSuccess}
        />
      )}
    </section>
  );
}
