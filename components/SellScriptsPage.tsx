"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    ExternalLinkIcon,
    MessageCircleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from "lucide-react";

interface SellScript {
    id: string;
    logo_url: string;
    company_name: string;
    company_id: string;
    quantity: number;
    price: number;
    type: string;
    updated_at: string;
    seller_id: string;
    created_at: string;
}

export default function SellScriptsPage() {
    const [scripts, setScripts] = useState<SellScript[]>([]);
    const [filtered, setFiltered] = useState<SellScript[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [editing, setEditing] = useState<{ [id: string]: number }>({});
    const [updating, setUpdating] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        company: "",
        minPrice: "",
        maxPrice: "",
        minQty: "",
    });

    useEffect(() => {
        fetch(`/api/sells/all`)
            .then((res) => res.json())
            .then((data) => {
                setScripts(data);
                setFiltered(data);
            });
    }, []);

    const applyFilters = () => {
        let result = [...scripts];

        if (filters.company)
            result = result.filter((s) =>
                s.company_name.toLowerCase().includes(filters.company.toLowerCase())
            );
        if (filters.minPrice)
            result = result.filter((s) => s.price >= parseFloat(filters.minPrice));
        if (filters.maxPrice)
            result = result.filter((s) => s.price <= parseFloat(filters.maxPrice));
        if (filters.minQty)
            result = result.filter((s) => s.quantity >= parseInt(filters.minQty));

        setFiltered(result);
    };

    const handleUpdate = async (id: string) => {
        // Prevent multiple submissions
        if (updating === id) return;
        
        const newPrice = editing[id];
        setUpdating(id);
        
        try {
            const response = await fetch(`/api/sells/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ price: newPrice }),
            });

            if (response.ok) {
                setScripts((prev) =>
                    prev.map((s) => (s.id === id ? { ...s, price: newPrice } : s))
                );
                setEditing(prev => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [id]: _, ...rest } = prev;
                    return rest;
                });
            } else {
                console.error("Failed to update price");
                // You might want to show a toast notification here
            }
        } catch (error) {
            console.error("Update error:", error);
            // You might want to show a toast notification here
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Sell Scripts Marketplace</h1>

            {/* Filters */ }
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted p-4 rounded-xl">
                <Input
                    placeholder="Company name"
                    value={ filters.company }
                    onChange={ (e) => setFilters({ ...filters, company: e.target.value }) }
                />
                <Input
                    placeholder="Min price"
                    type="number"
                    value={ filters.minPrice }
                    onChange={ (e) => setFilters({ ...filters, minPrice: e.target.value }) }
                />
                <Input
                    placeholder="Max price"
                    type="number"
                    value={ filters.maxPrice }
                    onChange={ (e) => setFilters({ ...filters, maxPrice: e.target.value }) }
                />
                <Input
                    placeholder="Min quantity"
                    type="number"
                    value={ filters.minQty }
                    onChange={ (e) => setFilters({ ...filters, minQty: e.target.value }) }
                />
                <div className="col-span-2 md:col-span-1">
                    <Button onClick={ applyFilters } className="w-full">
                        Apply Filters
                    </Button>
                </div>
            </div>

            {/* Card List */ }
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                { filtered.map((script) => {
                    const isExpanded = expanded === script.id;

                    return (
                        <Card
                            key={ script.id }
                            className="rounded-2xl shadow p-4 space-y-2 cursor-pointer"
                            onClick={ () =>
                                setExpanded((prev) => (prev === script.id ? null : script.id))
                            }
                        >
                            {/* Compact View */ }
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <Image
                                        src={ script.logo_url }
                                        alt={ script.company_name }
                                        width={ 45 }
                                        height={ 45 }
                                        className="rounded-full"
                                    />
                                    <div>
                                        <div className="font-semibold text-lg">
                                            { script.company_name }
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            { script.quantity } • { script.type }
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-primary font-semibold text-lg">
                                        ₹ { script.price.toFixed(2) }
                                    </div>
                                    { isExpanded ? (
                                        <ChevronUpIcon size={ 18 } className="text-muted-foreground" />
                                    ) : (
                                        <ChevronDownIcon size={ 18 } className="text-muted-foreground" />
                                    ) }
                                </div>
                            </div>

                            {/* Expanded Details */ }
                            { isExpanded && (
                                <div className="pt-3 border-t mt-2 space-y-2 text-sm text-muted-foreground">
                                    <div><strong>Script ID:</strong> { script.id }</div>
                                    <div><strong>Seller ID:</strong> { script.seller_id }</div>
                                    <div><strong>Created:</strong> { new Date(script.created_at).toLocaleString() }</div>
                                    <div><strong>Updated:</strong> { new Date(script.updated_at).toLocaleString() }</div>

                                    <div className="flex items-center gap-2 mt-2">
                                        <Input
                                            type="number"
                                            value={ editing[script.id] ?? script.price }
                                            onChange={ (e) =>
                                                setEditing({ ...editing, [script.id]: parseFloat(e.target.value) })
                                            }
                                            className="w-24"
                                        />
                                        <Button onClick={ () => handleUpdate(script.id) } disabled={ updating === script.id }>
                                            { updating === script.id ? "Updating..." : "Update Price" }
                                        </Button>
                                    </div>

                                    <div className="flex gap-2 mt-3">
                                        <Link href={ `/company/${script.company_id}` }>
                                            <Button variant="outline" className="flex gap-1 items-center">
                                                <ExternalLinkIcon size={ 14 } /> Company
                                            </Button>
                                        </Link>
                                        <Link href={ `/chat/${script.id}` }>
                                            <Button variant="outline" >
                                                <MessageCircleIcon size={ 14 } /> Chat
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ) }
                        </Card>
                    );
                }) }
            </div>
        </div>
    );
}
