"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ViewEncryptedPdf from "@/components/ViewEncryptedPdf";

type ScriptCardProps = {
  script: {
    file_name: string;
    file_url: string;
    uploaded_at: string;
    uploaded_by: string;
    companyName: string;
    companyurl: string;
    quantity: number;
    price: number;
    validuntil: string;
    legalnotes: string;
    image_url: string;
    verified: boolean | null;
    doc_type: string; // e.g., "ESOP", "Shares"
    mistake?: string;
  };
};

export default function ScriptCard({ script }: { script: ScriptCardProps["script"] }) {
  return (
    <Card className="bg-white text-gray-900 rounded-2xl shadow-lg border-2 border-green-200 overflow-hidden w-full max-w-md hover:scale-105 hover:shadow-xl transition-all">
      <CardHeader className="p-0">
        {script.image_url ? (
          <div className="w-full h-48 bg-green-50 flex items-center justify-center">
            <img
              src={script.image_url}
              alt={script.companyName}
              className="w-full h-48 object-cover rounded-t-2xl border-b-2 border-green-300"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-green-50 flex items-center justify-center text-gray-400 text-sm rounded-t-2xl border-b-2 border-green-300">
            No Image
          </div>
        )}
        <div className="p-4">
          <CardTitle className="text-xl font-bold text-green-700">{script.companyName}</CardTitle>
          <a
            href={script.companyurl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-green-600 underline break-all hover:text-green-700 transition"
          >
            {script.companyurl}
          </a>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-1 text-sm">
         <p>
          <span className="text-gray-600">Asset Type:</span> <span className="text-gray-900">{script.doc_type }</span>
        </p>
         <p>
          <span className="text-gray-600">Verified:</span> <span className="text-gray-900">{script.verified === true ? "Yes" : script.verified === false ? "denied" : "pending"}</span>
        </p>
        <p>
          <span className="text-gray-600">Quantity:</span> <span className="text-gray-900">{script.quantity}</span>
        </p>
        <p>
          <span className="text-gray-600">Price:</span> <span className="text-gray-900">₹{script.price}</span>
        </p>
        <p>
          <span className="text-gray-600">Valid Until:</span> <span className="text-gray-900">{script.validuntil}</span>
        </p>
        <p>
          <span className="text-gray-600">Legal Notes:</span> <span className="text-gray-900">{script.legalnotes || "—"}</span>
        </p>
        {script.mistake && (
          <p className="text-red-600">
            <span className="font-semibold">Issue:</span> {script.mistake}
            <p>You have to re-initialize the verification process</p>
          </p>
        )}
        <div className="pt-2">
          <ViewEncryptedPdf fileUrl={`https://syfidulqnceiwfvpywts.supabase.co/storage/v1/object/public/esop-uploads/${script.file_url}`} />
        </div>
      </CardContent>
    </Card>
  );
}
