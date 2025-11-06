"use client";

import { useEffect, useState } from "react";
import { ShareInfoCard } from "@/components/ShareInfoCard";
import SellScriptModal from "@/components/SellScriptModal";
import { useRouter } from "next/navigation";

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
}


export default function UserShareList({ userId}: Props) {
  const [shares, setShares] = useState<ShareData[]>([]);
  const [filter, setFilter] = useState("all");
  const [sellModalOpen, setSellModalOpen] = useState(false);
const [selectedShare, setSelectedShare] = useState<ShareData | null>(null);
const router = useRouter();
const handleSell = (share: ShareData) => {
  setSelectedShare(share);
  setSellModalOpen(true);
};
const handleBuy = (share:ShareData) => {
  router.push(`/dashboard/buy?name=${share.company_name}`);
 
};
 const fetchShares = async () => {
      const res = await fetch(`/api/user-shares?userId=${userId}`);
      const json = await res.json();

      // ✅ Fix: check if it's wrapped inside { data }
      const safeData = Array.isArray(json) ? json : json.data || [];
console.log("Fetched shares:", safeData);
      setShares(safeData);
    };
  useEffect(() => {
    fetchShares();
  }, [userId]);

  const filteredShares = shares.filter((s) =>
    filter === "all" ? true : s.type === filter
  );

  return (
  <section>
    {/* Header */}
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 pb-4 border-b-2 border-green-200">
      <div className="mb-4 md:mb-0">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Your Listed Shares</h2>
        <p className="text-sm text-gray-600">Manage and track your equity portfolio</p>
      </div>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="px-4 py-2.5 rounded-lg bg-white text-gray-900 border-2 border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 shadow-sm transition-all font-medium"
      >
        <option value="all">All Types</option>
        <option value="ESOP">ESOP</option>
        <option value="Shares">Shares</option>
      </select>
    </div>

    {/* Grid */}
    {filteredShares.length === 0 ? (
      <div className="bg-green-50 rounded-2xl border border-green-200 p-12 text-center">
        <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No shares listed yet</h3>
        <p className="text-gray-600 mb-6">Start by listing your shares to begin trading</p>
        <a 
          href="/dashboard/documents"
          className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all"
        >
          List Your First Share
        </a>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
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

    {/* 🔽 Embed modal at the end of JSX */}
    {selectedShare && (
      <SellScriptModal
        open={sellModalOpen}
        onClose={() => setSellModalOpen(false)}
        share={selectedShare}
        sellerId={userId}
         onSuccess={fetchShares} 
      />
    )}
  </section>
);
}
