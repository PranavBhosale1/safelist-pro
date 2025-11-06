"use client";


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
  const handleClick = (e: React.MouseEvent, action: "buy" | "sell") => {
    e.preventDefault(); // prevent navigation from Link
    e.stopPropagation();

    if (action === "buy") {
      onBuy?.(share); // 👈 Call onBuy with full share
    } else if (action === "sell") {
      onSell?.(share); // 👈 Call onSell with full share
    }
  };

  return (
   
      <div className="group p-6 rounded-2xl bg-white shadow border border-green-200 hover:shadow-md hover:border-green-300 transition-all duration-200 cursor-pointer">
        {/* Header */ }
        <div className="flex justify-between items-start mb-4 pb-4 border-b border-green-100"
         onClick={() => {
          const params = new URLSearchParams({
            name: share.company_name,
            location: '', // script.location is not present
            rating: '',   // script.rating is not present
            url:  '',
            logo: share.image_url || '',
          }).toString();
          router.push(`/company_info?${params}`);
         }}
         >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-green-50 p-1 border border-green-200">
              <img
                src={ share.image_url }
                alt={ `${share.company_name} logo` }
                className="w-full h-full rounded-lg object-cover"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition">{ share.company_name }</h2>
              <p className="text-xs text-gray-500">Company Equity</p>
            </div>
          </div>

          <span className="text-xs px-3 py-1.5 rounded-full bg-green-600 text-white font-semibold">
            { share.type }
          </span>
        </div>

        {/* Info */ }
        <div className="bg-green-50 rounded-xl p-4 mb-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Quantity</p>
              <p className="text-xl font-bold text-green-700">{ share.quantity }</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Action Buttons */ }
        <div className="flex gap-3">
          <Button
            onClick={ (e) => handleClick(e, "buy") }
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5"
          >
            Buy
          </Button>

          <Button
            onClick={ (e) => handleClick(e, "sell") }
            variant="outline"
            className="flex-1 font-semibold py-2.5"
          >
            Sell
          </Button>
        </div>
      </div>
    
  );
}
