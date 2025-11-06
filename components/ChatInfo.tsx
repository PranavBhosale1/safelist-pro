"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

interface ChatInfoProps {
  scriptId: string;
}

interface SellScript {
  id: string;
  company_name: string;
  logo_url?: string;
  type?: string;
  quantity?: number;
  price?: number | null;
  verified?: boolean;
  forSale?: boolean;
  seller_id?: string;
  doc_url?: string;
  status?: string | null;
  prev_price?: number | null;
}

export default function ChatInfo({ scriptId }: ChatInfoProps) {
  const [script, setScript] = useState<SellScript | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  

  useEffect(() => {
    if (!scriptId) return;

    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("sell_script")
          .select(
            // only request columns that exist in the DB schema
            "id, company_name, logo_url, type, quantity, price, seller_id, doc_url, status, prev_price, created_at, updated_at"
          )
          .eq("id", scriptId)
          .single();
console.log("dddd")
          console.log(data);
          console.log("error");
        if (!error && mounted) {
          setScript(data || null);
        } else if (error) {
          console.warn("ChatInfo: failed to load script:", error.message || error);
        }
      } catch (err) {
        console.error("ChatInfo load error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [scriptId]);

  

  if (loading) {
    return (
      <div className="px-4 py-3 border-t-2 border-green-200 bg-green-50">
        <p className="text-sm text-gray-600">Loading script info…</p>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="px-4 py-3 border-t-2 border-green-200 bg-green-50">
        <p className="text-sm text-gray-600">No script information available.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-t-2 border-green-200 bg-green-50">
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="w-full text-left hover:bg-green-100 rounded-md p-0 focus:outline-none"
      >
        <div className="flex items-center gap-3 p-2">
          <img
            src={script.logo_url || "/favicon.ico"}
            alt={script.company_name}
            className="w-12 h-12 rounded-md object-cover border-2 border-green-200"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{script.company_name}</h3>
              <span className="text-xs text-gray-600">{script.type || "Shares"}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-sm text-gray-700 p-2">
          <div>
            <div className="text-xs text-gray-500">Quantity</div>
            <div className="font-medium">{script.quantity ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Price</div>
            <div className="font-medium">{typeof script.price === 'number' ? `₹${script.price.toFixed(2)}` : "—"}</div>
          </div>
          <div>
          </div>
        </div>
      </button>

      {showModal && script && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold">{script.company_name} — Script info</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-800"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-800">
              <div>
                <div className="text-xs text-gray-500">Company</div>
                <div className="font-medium">{script.company_name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Type</div>
                <div className="font-medium">{script.type}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Quantity</div>
                <div className="font-medium">{script.quantity}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Price</div>
                <div className="font-medium">{typeof script.price === 'number' ? `₹${script.price.toFixed(2)}` : script.price}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Previous price</div>
                <div className="font-medium">{script.prev_price ?? '—'}</div>
              </div>

              
              <div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-gray-100">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
