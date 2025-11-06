"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog,  DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ShareData {
  id: string;
  company_name: string;
  image_url: string;
  type: "ESOP" | "Shares";
  quantity: number;
  doc_url: string; // Optional, if you want to track a document URL
}

interface Props {
  open: boolean;
  onClose: () => void;
  share: ShareData;
  sellerId: string;
  onSuccess?: () => void; // 👈 new
}

export default function SellScriptModal({ open, onClose, share, sellerId, onSuccess }: Props) {
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setQuantity("");
      setPrice("");
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const qty = parseInt(quantity);
      const prc = parseFloat(price);
      

      if (!qty || !prc || qty <= 0 || qty > share.quantity) {
        toast.error(`Quantity must be between 1 and ${share.quantity}`);
        return;
      }

      const payload = {
        company_name: share.company_name,
        logo_url: share.image_url,
        type: share.type,
        quantity: qty,
        price: prc,
        seller_id: sellerId,
        share_id: share.id, // optional, in case you want to track which share it came from
        doc_url: share.doc_url, // Optional, if you want to track a document URL
      };

      const res = await fetch("/api/sells-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

       if (res.ok) {
        toast.success("Script listed");
        onClose();
        onSuccess?.(); // ✅ trigger router.refresh()
      } else {
        toast.error("Error adding script");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Error adding script");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-black/70 backdrop-blur-xl border-2 p-8 rounded-2xl animate-fadeIn">
        <DialogHeader>
          <span className="text-2xl font-bold text-emerald-400">Sell Script</span>
        </DialogHeader>
        <div className="space-y-5 mt-4">
          <div>
            <Label className="text-black">Company</Label>
            <Input value={share.company_name} disabled className="bg-black/60 border-[#7c3aed]/30 text-black placeholder:text-white/40 focus:ring-[#7c3aed]" />
          </div>
          <div>
            <Label className="text-black">Type</Label>
            <Input value={share.type} disabled className="bg-black/60 border-[#7c3aed]/30 text-black placeholder:text-white/40 focus:ring-[#7c3aed]" />
          </div>
          <div>
            <Label className="text-black">Available Quantity</Label>
            <Input value={share.quantity} disabled className="bg-black/60 border-[#7c3aed]/30 text-black placeholder:text-white/40 focus:ring-[#7c3aed]" />
          </div>
          <div>
            <Label className="text-black">Quantity to Sell</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={`Max ${share.quantity}`}
              className="bg-black/60 border-[#7c3aed]/30 text-black placeholder:text-white/40 focus:ring-[#7c3aed]"
            />
          </div>
          <div>
            <Label className="text-black">Price (₹)</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 150.00"
              className="bg-black/60 border-[#7c3aed]/30 text-black placeholder:text-white/40 focus:ring-[#7c3aed]"
            />
          </div>
          <Button className="w-full px-6 py-3 bg-emerald-600 hover:scale-105 transition-all animate-fadeInUp" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Confirm Sell"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
