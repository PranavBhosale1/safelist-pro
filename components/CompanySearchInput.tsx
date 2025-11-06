"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
    companyName: string;
    companyUrl: string;
    image_url: string; // Optional image URL
    onChange: (name: string, url: string, image_url: string) => void;
}

export default function CompanySearchInput({ companyName, companyUrl, image_url, onChange }: Props) {
    const [query, setQuery] = useState(companyName || "");
    const [suggestion, setSuggestion] = useState<{ name: string; url: string; image_url: string } | null>(null);
    const [loading, setLoading] = useState(0);
    const [skipSearch, setSkipSearch] = useState(false);
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (skipSearch) {
                setSkipSearch(false); // Reset after skipping
                return;
            }
            if (query.trim().length > 1) {
                console.log("🔍 Fetching company for query:", query);
                fetchCompany(query);
            } else {
                console.log("🧹 Clearing suggestion due to short query");
                setSuggestion(null);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [query]);

    const fetchCompany = async (searchTerm: string) => {
        setLoading(1);
        try {
            const res = await fetch(`/api/traxcn_card?name=${encodeURIComponent(searchTerm)}`);
            const data = await res.json();
            console.log("📦 API response:", data);

            if (Array.isArray(data) && data.length > 0) {
                // Find the best match - exact match first, then starts with, then contains
                const searchTermLower = searchTerm.toLowerCase();
                let bestMatch = data[0];
                
                for (const item of data) {
                    if (!item?.name || !item?.url) continue;
                    
                    const itemNameLower = item.name.toLowerCase();
                    
                    // Prioritize exact match
                    if (itemNameLower === searchTermLower) {
                        bestMatch = item;
                        break;
                    }
                    // Then prioritize starts with
                    if (itemNameLower.startsWith(searchTermLower) && !bestMatch.name.toLowerCase().startsWith(searchTermLower)) {
                        bestMatch = item;
                    }
                }
                
                if (bestMatch?.name && bestMatch?.url) {
                    setSuggestion({ name: bestMatch.name, url: bestMatch.url, image_url: bestMatch.logo || "" });
                    setLoading(0);
                    console.log("✅ Set suggestion:", { name: bestMatch.name, url: bestMatch.url });
                } else {
                    setLoading(2);
                    console.warn("⚠️ No valid suggestion in response");
                    setSuggestion(null);
                }
            } else {
                setLoading(2);
                console.warn("⚠️ No valid suggestion in response");
                setSuggestion(null);
            }
        } catch (err) {
            setLoading(2);
            console.error("❌ Failed to fetch company:", err);
            setSuggestion(null);
        }
    };


    const handleSelect = () => {
        if (!suggestion) return;

        const selectedName = suggestion.name;
        const selectedUrl = `${suggestion.url}`;
        const selectedImageUrl = suggestion.image_url || "";
        console.log("🖱️ User selected:", selectedName, selectedUrl);

        if (selectedName !== companyName || selectedUrl !== companyUrl || selectedImageUrl !== image_url) {
            onChange(selectedName, selectedUrl, selectedImageUrl);
        }

        setSkipSearch(true);
        setQuery(selectedName);

        setSuggestion(null);
    };

    return (
        <div className="space-y-2 relative">
            <Label>Search Company</Label>
            <Input
                placeholder="eg. Cisco"
                value={ query }
                onChange={ (e) => {
                    console.log("✏️ User typed:", e.target.value);
                    setQuery(e.target.value);
                } }
            />
            { loading === 1 && (
                <div className="text-sm text-gray-400 mt-1">Searching...</div>
            ) }
            { loading === 2 && (
                <div className="text-sm text-gray-400 mt-1">No suggestions found</div>
            ) }
            { suggestion && (
                <div
                    className="absolute z-10 w-full bg-white border-2 border-green-300 rounded-lg shadow-lg mt-1"
                >
                    <div
                        className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-green-100 last:border-b-0"
                        onClick={ handleSelect }
                    >
                        <div className="font-semibold text-gray-900">{ suggestion.name }</div>
                        <div className="text-sm text-gray-600 mt-1">{ suggestion.url }</div>
                    </div>
                </div>
            ) }
        </div>
    );
}
