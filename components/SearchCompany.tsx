"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';

type Company = {
  name: string;
  location: string;
  rating: string;
  url: string;
  logo: string;
};

export default function SearchCompanyPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) return;

      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/traxcn_card?name=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("API failed");

        const data = await res.json();
        if (!data || data.length === 0) {
          setError("No companies found.");
          setResults([]);
        } else {
          setResults(data);
        }
        setShowDropdown(true);
      } catch (error) {
        console.error("Failed to fetch company search:", error);
        setError("Failed to fetch company. Please try again later.");
        setResults([]);
        setShowDropdown(true);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 500);
    return () => clearTimeout(debounce);
  }, [query]);

  // 👇 Detect outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Focus input when expanding
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex items-center">
        {/* Layout: icon stays on the right (near profile), input expands to the left on hover */}
        <div
          className="flex items-center flex-row-reverse"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => { setIsOpen(false); setShowDropdown(false); }}
        >
          {!isOpen && (
            <motion.button
              type="button"
              aria-label="Search"
              whileTap={{ scale: 0.95 }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border-0 text-gray-800 hover:bg-gray-100 transition-colors shadow-md hover:shadow-lg"
            >
              <Search className="h-5 w-5" />
            </motion.button>
          )}

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                key="search-input-left"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                className="overflow-hidden mr-2"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Search for a company..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="text-black pl-9 !rounded-full !border-0 !border-none focus:!ring-0 focus:!border-0 shadow-none"
                    onFocus={() => {
                      if (results.length > 0 || error || loading) setShowDropdown(true);
                    }}
                    onKeyDown={(e) => {
                      if ((e as React.KeyboardEvent<HTMLInputElement>).key === 'Escape') {
                        setIsOpen(false);
                        setShowDropdown(false);
                      }
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showDropdown && (loading || error || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="absolute mt-2 bg-white border-2 border-green-300 shadow-lg rounded-xl p-4 w-96 z-50"
          >
            {loading && <div className="text-green-600 font-medium">Searching...</div>}
            {error && <div className="text-red-600 mb-4">{error}</div>}

            <div className="grid grid-cols-1 gap-4 max-h-[28rem] lg:max-h-[36rem] overflow-y-auto">
              <AnimatePresence>
                {results.map((company) => (
                  <Link
                    key={company.name}
                    href={{
                      pathname: "/company_info",
                      query: {
                        name: company.name,
                        location: company.location,
                        rating: company.rating,
                        url: company.url,
                        logo: company.logo,
                      },
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: 'easeInOut' }}
                    >
                      <Card className="bg-white hover:bg-green-50 transition-all border-2 border-green-200 shadow-md hover:shadow-lg">
                        <CardContent className="p-4 flex items-center gap-4">
                          <Image
                            src={company.logo}
                            alt={company.name}
                            width={50}
                            height={50}
                            className="rounded-md border border-green-200"
                          />
                          <div>
                            <h2 className="text-lg font-bold text-gray-900">{company.name}</h2>
                            <p className="text-xs text-gray-600">{company.location}</p>
                            <p className="text-xs text-gray-700">⭐ Rating: {company.rating}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
