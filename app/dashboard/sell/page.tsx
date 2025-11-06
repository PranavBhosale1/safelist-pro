"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

import SellScriptDetails from "@/components/SellScriptDetails";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {  useRouter, useSearchParams } from "next/navigation";

// Optional: Replace with your own types
type SellScript = {
  id: string;
  seller_id: string;
  company_name: string;
  logo_url: string;
  type: "ESOP" | "Shares";
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
  prev_price?: number;
  doc_url: string; // Optional, if you want to track a document URL
  status: "listed" | "negotiation" | "sold";
};

export default function SellPage() {
  const { data: session, status } = useSession();
  const [scripts, setScripts] = useState<SellScript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortStatus, setSortStatus] = useState("listed");
  const searchParams = useSearchParams();
  const name = searchParams.get('name');
  const [search, setSearch] = useState(() => name || "");
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signup"); // or "/auth/signin"
    }
  }, [status, router]);
  useEffect(() => {
    const fetchSellScripts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/sell-scripts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: session?.user?.id }),
        });
        const json = await response.json();
        if (response.ok) {
          setScripts(json.data || []);
        } else {
          console.error("Failed to fetch sell scripts:", json.error);
        }
      } catch (err) {
        console.error("Unexpected error while fetching sell scripts:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (session?.user?.id) {
      fetchSellScripts();
    }
  }, [session]);

  const [selectedScript, setSelectedScript] = useState<SellScript | null>(null);

  const handleCardClick = (script: SellScript) => {
    setSelectedScript(script);
  };

  const handleClose = () => setSelectedScript(null);
  const handleEdit = (script: SellScript) => {
    // Open edit modal or navigate
    console.log("Edit", script);
  };
  const handleDelete = (id: string) => {
    // Confirm and delete from database
    console.log("Delete", id);
  };

  // Example: Add status to scripts (in real app, status should come from backend)
  const getStatus = (script: SellScript) => {
    return script.status;
  };

  const filteredScripts = scripts
    .filter((script) =>
      script.company_name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((script) =>
      statusFilter === "all" ? true : getStatus(script) === statusFilter
    )
    .sort((a) => {
      if (sortStatus === "listed") return getStatus(a) === "listed" ? -1 : 1;
      if (sortStatus === "negotiation") return getStatus(a) === "negotiation" ? -1 : 1;
      if (sortStatus === "sold") return getStatus(a) === "sold" ? -1 : 1;
      return 0;
    });

  return (
    <main className="min-h-screen px-6 py-10 bg-white text-gray-900">
      <h1 className="text-3xl font-extrabold mb-8 tracking-tight bg-gradient-to-r from-green-600 to-green-700 text-transparent bg-clip-text">All Listed Shares for Sale</h1>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <Input
          type="text"
          placeholder="Search by company name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs bg-white border-green-300 text-gray-900 placeholder:text-gray-400 focus:ring-green-500 focus:border-green-600 shadow-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white border-green-300 text-gray-900 focus:ring-green-500 focus:border-green-600 shadow-sm">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="listed">Listed</SelectItem>
            <SelectItem value="negotiation">Negotiation</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortStatus} onValueChange={setSortStatus}>
          <SelectTrigger className="w-40 bg-white border-green-300 text-gray-900 focus:ring-green-500 focus:border-green-600 shadow-sm">
            <SelectValue placeholder="Sort by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="listed">Listed First</SelectItem>
            <SelectItem value="negotiation">Negotiation First</SelectItem>
            <SelectItem value="sold">Sold First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="relative p-5 rounded-2xl bg-green-50 border-2 border-green-200 shadow-md animate-pulse overflow-hidden min-h-[140px]"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
            >
              <div className="absolute top-3 right-3 w-20 h-6 rounded-full bg-green-300" />
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-200" />
                <div className="flex-1 space-y-2">
                  <div className="w-24 h-4 rounded bg-green-200" />
                  <div className="w-14 h-3 rounded bg-green-200" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-20 h-3 rounded bg-green-100" />
                <div className="w-28 h-3 rounded bg-green-100" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : filteredScripts.length === 0 ? (
        <p className="text-gray-600 text-lg mt-12 text-center">No sell scripts found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredScripts.map((script, i) => (
              <motion.div
                key={script.id}
                onClick={() => handleCardClick(script)}
                className="relative p-5 rounded-2xl bg-white border-2 border-green-200 shadow-md cursor-pointer hover:shadow-lg hover:bg-green-50 transition-all duration-200 overflow-hidden group"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.97 }}
                transition={{ delay: i * 0.07, duration: 0.32, type: 'spring', bounce: 0.28 }}
              >
                <Badge className="absolute top-3 right-3 bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md capitalize">{getStatus(script)}</Badge>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={script.logo_url}
                    alt={script.company_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-green-300 shadow"
                  />
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 drop-shadow-sm group-hover:text-green-600 transition">{script.company_name}</h2>
                    <span className="text-xs font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 px-2 py-0.5 rounded-full shadow-sm">{script.type}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>Qty: <span className="font-semibold text-green-600">{script.quantity}</span></p>
                  <p>Price: <span className="font-semibold text-green-600">₹{script.price.toFixed(2)}</span></p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      {selectedScript && (
        <SellScriptDetails
          script={selectedScript}
          onClose={handleClose}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </main>
  );
}
