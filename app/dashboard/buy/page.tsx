"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import BuyScript from "@/components/BuyScript"; // New modal with Connect
import { useSession } from 'next-auth/react';
import {  useRouter, useSearchParams } from 'next/navigation';
import { Filter as FilterIcon, X as CloseIcon } from 'lucide-react';

interface SellScript {
    id: string;
    company_name: string;
    logo_url: string;
    type: "ESOP" | "Shares";
    quantity: number;
    price: number;
    verified: boolean;
    forSale: boolean;
    seller_id: string; // Optional seller_id for the user who is selling
    doc_url: string; // Optional, if you want to track a document URL
}

export default function BuyPage() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [scripts, setScripts] = useState<SellScript[]>([]);
    const [selectedScript, setSelectedScript] = useState<SellScript | null>(null);
    const searchParams = useSearchParams();
    const name = searchParams.get('name');
    const [search, setSearch] = useState(() => name || "");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [typeFilter, setTypeFilter] = useState("all");
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef<HTMLDivElement | null>(null);
    const PAGE_SIZE = 10;
    const [loading, setLoading] = useState(false);
    const lastLoadedPageRef = useRef<number>(-1);
    const { data: session, status } = useSession();
    const userId = session?.user?.id;
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
        if (userId) fetchBalance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);
    const router = useRouter();
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    useEffect(() => {
        lastLoadedPageRef.current = -1;
        setPage(0);
        loadScripts(0, true);
    }, [search, sortOrder]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                const nextPage = page + 1;

                if (lastLoadedPageRef.current >= nextPage) return;

                lastLoadedPageRef.current = nextPage;
                loadScripts(nextPage);
            }
        }, { threshold: 1 });

        const raf = requestAnimationFrame(() => {
            if (loaderRef.current) observer.observe(loaderRef.current);
        });

        return () => {
            cancelAnimationFrame(raf);
            if (loaderRef.current) observer.unobserve(loaderRef.current);
        };
    }, [page, hasMore, loading]);

    const loadScripts = async (pageToLoad: number, reset = false) => {
        if (loading) return;
        setLoading(true);

        const { data, error } = await supabase
            .from("sell_script")
            .select("*")
            .ilike("company_name", `%${search}%`)
            .filter("seller_id", "neq", userId)
            .order("price", { ascending: sortOrder === "asc" })
            .range(pageToLoad * PAGE_SIZE, pageToLoad * PAGE_SIZE + PAGE_SIZE - 1);

        if (error) {
            console.error("Error fetching scripts:", error.message);
            setLoading(false);
            return;
        }
        console.log("Fetched scripts 111c :", data);
        if (reset) {
            setScripts(data || []);
            setPage(0);
        } else {
            setScripts((prev) => [...prev, ...(data || [])]);
            setPage(pageToLoad); // ⬅️ Make sure this sets the current page
        }

        // If we received less than a full page, assume no more data
        setHasMore(data && data.length === PAGE_SIZE);
        setLoading(false);
    };

    const handleConnect = (script: SellScript) => {
        setSelectedScript(script);
    }; 
    useEffect(() => {
        if (status === "unauthenticated") {
          router.replace("/auth/signup"); // or "/auth/signin"
        }
      }, [status, router]);
    return (
        <div className="p-4 text-gray-900 bg-white min-h-screen">
            {/* Title bar with available connections */}
            <div className="flex items-center justify-between mb-4 w-full">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Buy</h1>
                    <div className="text-sm text-gray-600">Browse available scripts and connect</div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500">Available connections</div>
                    <div className="text-xl font-semibold text-gray-900">{coins == null ? '—' : coins}</div>
                </div>
            </div>

            {/* Desktop: Search and Filters in a Row */}
            <div className="hidden md:flex gap-4 items-center mb-6 w-full">
                <input
                    type="text"
                    placeholder="Search by company..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 min-w-0 px-4 py-2 rounded-lg bg-white text-gray-900 border-2 border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 shadow-sm transition-all"
                />
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white text-gray-900 border-2 border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 shadow-sm transition-all"
                >
                    <option value="all">All Types</option>
                    <option value="Shares">Shares</option>
                    <option value="ESOP">ESOP</option>
                </select>
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white text-gray-900 border-2 border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 shadow-sm transition-all"
                >
                    <option value="asc">Price ↑</option>
                    <option value="desc">Price ↓</option>
                </select>
            </div>
            {/* Mobile: Search bar above, filter button below */}
            <div className="md:hidden mb-4">
                <input
                    type="text"
                    placeholder="Search by company..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-white text-gray-900 border-2 border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 shadow-sm transition-all max-w-xs w-full mb-2"
                />
                <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold shadow-md border-2 border-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    onClick={() => setShowMobileFilters(true)}
                >
                    <FilterIcon className="w-5 h-5" />
                    Filter
                </button>
            </div>
            {/* Mobile Filter Modal */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur">
                    <div className="bg-white border-2 border-green-300 rounded-2xl shadow-xl p-6 w-11/12 max-w-sm mx-auto relative flex flex-col gap-4">
                        <button
                            className="absolute top-3 right-3 text-gray-700 hover:text-green-600 focus:outline-none"
                            onClick={() => setShowMobileFilters(false)}
                            aria-label="Close filters"
                        >
                            <CloseIcon className="w-6 h-6" />
                        </button>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-white text-gray-900 border-2 border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 shadow-sm transition-all"
                        >
                            <option value="all">All Types</option>
                            <option value="Shares">Shares</option>
                            <option value="ESOP">ESOP</option>
                        </select>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                            className="px-3 py-2 rounded-lg bg-white text-gray-900 border-2 border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 shadow-sm transition-all"
                        >
                            <option value="asc">Price ↑</option>
                            <option value="desc">Price ↓</option>
                        </select>
                        <button
                            className="mt-2 w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-2 rounded-lg shadow-md border-2 border-green-600"
                            onClick={() => setShowMobileFilters(false)}
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-green-50 p-6 rounded-xl border-2 border-green-200 shadow-md h-40" />
                    ))}
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scripts
                        .filter(script => typeFilter === "all" ? true : script.type === typeFilter)
                        .map((script) => (
                            <div
                                key={script.id}
                                onClick={() => handleConnect(script)}
                                className="cursor-pointer bg-white p-4 rounded-xl border-2 border-green-200 shadow-md hover:scale-105 hover:shadow-lg hover:bg-green-50 transition-all"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <img
                                        src={script.logo_url}
                                        alt={script.company_name}
                                        className="w-8 h-8 rounded-full object-cover border-2 border-green-300"
                                    />
                                    <div>
                                        <h2 className="font-semibold text-lg text-gray-900">{script.company_name}</h2>
                                        <span className="text-xs bg-gradient-to-r from-green-600 to-green-700 text-white px-2 py-0.5 rounded shadow-sm">
                                            {script.type}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">Qty: {script.quantity}</p>
                                <p className="text-sm text-gray-600">Price: ₹{script.price.toFixed(2)}</p>
                            </div>
                        ))}
                </div>
            )}
            <div ref={loaderRef} className="h-10" />

            {selectedScript && (
                <BuyScript
                    script={selectedScript}
                    onClose={() => setSelectedScript(null)}
                />
            )}
        </div>
    );
}
