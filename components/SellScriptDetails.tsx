// components/SellScriptDetails.tsx

import { ExternalLink, Pencil, Trash } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface SellScript {
  id: string;
  company_name: string;
  logo_url: string;
  type: "ESOP" | "Shares";
  quantity: number;
  price: number;
  company_url?: string; 
  created_at: string;
  updated_at: string;
   prev_price?: number;
   seller_id: string;
   doc_url: string; // Optional, if you want to track a document URL

}

interface Props {
  script: SellScript;
  onClose: () => void;
  onEdit: (script: SellScript) => void;
  onDelete: (id: string) => void;
}
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
// 🟡 Edit Handler


export default function SellScriptDetails({ script, onClose }: Props) {
    
const updated_at =  script.updated_at;
const created_at = script.created_at ;
const date_updated = new Date(updated_at);
const date_created = new Date(created_at);
const router = useRouter();
const [isEditing, setIsEditing] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);

const handleEditClick = async () => {
  // Prevent multiple submissions
  if (isEditing) return;
  
  setIsEditing(true);
  
  try {
    const newPrice = prompt("Enter new price:");

    if (!newPrice) return;
    const priceNumber = parseFloat(newPrice);
    if (isNaN(priceNumber)) {
      alert("Please enter a valid number.");
      return;
    }

    const { error } = await supabase
      .from("sell_script")
      .update({ price: priceNumber })
      .eq("id", script.id);

    if (error) {
      console.error("Update error:", error.message);
      alert("Failed to update price.");
    } else {
      alert("Price updated successfully!");
      location.reload(); // 🔁 Refresh the page
    }
  } catch (error) {
    console.error("Edit error:", error);
    alert("Failed to update price.");
  } finally {
    setIsEditing(false);
  }
};

// 🔴 Delete Handler
const handleDeleteClick = async () => {
  // Prevent multiple submissions
  if (isDeleting) return;
  
  setIsDeleting(true);
  
  try {
    const confirmDelete = confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;
    
    console.log("Deleting script:", script.seller_id, script.company_name);
    // Step 1: Check if entry exists in `verified_share`
    const { data: existing, error: fetchError } = await supabase
      .from("verified_shares")
      .select("*")
      .eq("company_name", script.company_name)
      .eq("user_id", script.seller_id) // Make sure `user_id` exists in SellScript

    if (fetchError) {
      console.error("Error checking verified_share:", fetchError.message);
      alert("Error during verification check.");
      return;
    }

    // Step 2: Insert into verified_share if not already there
    if (!existing || existing.length === 0) {
      const { error: insertError } = await supabase
        .from("verified_share")
        .insert({
          user_id: script.seller_id,
          company_name: script.company_name,
          quantity: script.quantity,
          price: script.price,
          type: script.type,
          logo_url: script.logo_url,
        });

      if (insertError) {
        console.error("Insert error:", insertError.message);
        alert("Failed to insert into verified_share.");
        return;
      }
    }

    // Step 3: Delete from sell_script
    const { error: deleteError } = await supabase
      .from("sell_script")
      .delete()
      .eq("id", script.id);

    if (deleteError) {
      console.error("Delete error:", deleteError.message);
      alert("Failed to delete script.");
    } else {
      alert("Deleted and verified copy saved successfully!");
      location.reload(); // 🔁 Refresh the page
    }
  } catch (error) {
    console.error("Delete error:", error);
    alert("Failed to delete script.");
  } finally {
    setIsDeleting(false);
  }
};

  const modalRef = useRef<HTMLDivElement>(null);

  // Trap focus inside modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Focus modal on mount
  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ backdropFilter: "blur(10px)", background: "rgba(10,10,20,0.65)" }}
        aria-modal="true"
        tabIndex={-1}
      >
        <motion.div
          ref={modalRef}
          className="relative max-w-md w-full p-0 rounded-2xl shadow-2xl focus:outline-none"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { type: 'spring', bounce: 0.32, duration: 0.5 } }}
          exit={{ scale: 0.95, opacity: 0 }}
          tabIndex={0}
        >
          <div className="bg-white/10 border border-purple-500/40 backdrop-blur-xl px-8 py-7 rounded-2xl relative overflow-hidden shadow-xl ring-1 ring-blue-500/20">
            <button
              onClick={onClose}
              className="absolute top-3 right-4 text-white/60 hover:text-purple-400 text-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full transition"
              aria-label="Close details"
            >
              ×
            </button>

            <div className="flex items-center gap-4 mb-6 cursor-pointer"
             onClick={() => {
              const params = new URLSearchParams({
                name: script.company_name,
                location: '', // script.location is not present
                rating: '',   // script.rating is not present
                url: script.company_url || '',
                logo: script.logo_url || '',
              }).toString();
              router.push(`/company_info?${params}`);
            }}
            >
              {script.logo_url ? (
                <motion.img
                  src={script.logo_url}
                  alt={script.company_name}
                  className="w-14 h-14 rounded-full border-2 border-purple-500/60 shadow-md bg-white/10"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              ) : (
                <motion.div
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-md"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                >
                  {/* Abstract SVG icon */}
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="2" opacity="0.5" />
                    <rect x="10" y="10" width="12" height="12" rx="4" fill="white" fillOpacity="0.2" />
                  </svg>
                </motion.div>
              )}
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight mb-1 drop-shadow-lg">
                  {script.company_name}
                </h2>
                <span className="inline-block text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 px-3 py-1 rounded-full shadow-sm animate-pulse">
                  {script.type}
                </span>
              </div>
            </div>

            <motion.div
              className="space-y-2 text-base text-white/90 mb-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
              }}
            >
              <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                <span className="font-semibold text-purple-400">Script Id:</span> {script.id}
              </motion.p>
              <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                <span className="font-semibold text-blue-400">Quantity:</span> {script.quantity}
              </motion.p>
              <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                <span className="font-semibold text-purple-400">Price:</span> ₹{script.price.toFixed(2)}
              </motion.p>
              <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                <span className="font-semibold text-blue-400">Updated At:</span> {new Date(date_updated).toLocaleString()}
              </motion.p>
              <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                <span className="font-semibold text-purple-400">Created At:</span> {new Date(date_created).toLocaleString()}
              </motion.p>
              <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                <span className="font-semibold text-blue-400">Last price:</span> {script.prev_price || <span className="italic text-white/60">this is the og price</span>}
              </motion.p>
            </motion.div>

            {script.company_url && (
              <a
                href={script.company_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-purple-400 transition underline underline-offset-2 mb-6"
              >
                <ExternalLink className="w-4 h-4" /> Visit Company
              </a>
            )}

            <div className="flex flex-col gap-3 mt-2">
              <motion.button
                onClick={handleEditClick}
                disabled={isEditing}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold shadow-lg hover:from-blue-600 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 active:scale-95 animate-glow disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isEditing ? 1 : 1.04 }}
                whileTap={{ scale: isEditing ? 1 : 0.97 }}
              >
                <Pencil className="w-5 h-5" /> {isEditing ? "Updating..." : "Edit Price"}
              </motion.button>
              <motion.button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-500 text-white font-bold shadow-lg hover:from-purple-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 active:scale-95 animate-glow disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isDeleting ? 1 : 1.04 }}
                whileTap={{ scale: isDeleting ? 1 : 0.97 }}
              >
                <Trash className="w-5 h-5" /> {isDeleting ? "Deleting..." : "Delete"}
              </motion.button>
            </div>

            {/* Glow border effect */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-purple-500/40 blur-[2px] opacity-60 animate-pulse" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
