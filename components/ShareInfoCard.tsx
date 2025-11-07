"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ShareData {
  id: string;
  company_name: string;
  image_url: string;
  type: "ESOP" | "Shares";
  quantity: number;
  doc_url: string; // Optional, if you want to track a document URL
}

interface ShareInfoCardProps {
  share: ShareData;
  onBuy?: (share: ShareData) => void;
  onSell?: (share: ShareData) => void;
}


export function ShareInfoCard({ share, onBuy, onSell }: ShareInfoCardProps) {
  const router = useRouter();
  const handleActionClick = (event: MouseEvent<HTMLButtonElement>, action: "buy" | "sell") => {
    event.preventDefault();
    event.stopPropagation();

    if (action === "buy") {
      onBuy?.(share);
    } else {
      onSell?.(share);
    }
  };

  const openCompanyDetails = () => {
    const params = new URLSearchParams({
      name: share.company_name,
      location: '',
      rating: '',
      url: '',
      logo: share.image_url || '',
    }).toString();

    router.push(`/company_info?${params}`);
  };

  const badgeTone = share.type === "ESOP"
    ? "border-blue-100 bg-blue-50 text-blue-700"
    : "border-emerald-100 bg-emerald-50 text-emerald-700";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openCompanyDetails}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openCompanyDetails();
        }
      }}
      className="group relative flex h-full w-full flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-green-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-200 overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-inset ring-gray-200">
            {share.image_url ? (
              <img
                src={share.image_url}
                alt={`${share.company_name} logo`}
                className="h-8 w-8 object-contain"
              />
            ) : (
              <span className="text-sm font-semibold uppercase text-gray-500">
                {share.company_name.slice(0, 2)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-gray-900 transition-colors group-hover:text-green-700">
              {share.company_name}
            </h2>
            <p className="text-xs text-gray-500">Company equity</p>
          </div>
        </div>

        <span
          className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${badgeTone}`}
        >
          {share.type}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-5">
          <p className="text-xs uppercase tracking-wide text-gray-400">Quantity</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {share.quantity.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-auto flex gap-3 pt-2">
        <Button
          onClick={(event) => handleActionClick(event, "buy")}
          variant="primary"
          size="sm"
          className="flex-1"
        >
          Buy
        </Button>

        <Button
          onClick={(event) => handleActionClick(event, "sell")}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          Sell
        </Button>
      </div>
    </div>
  );
}
