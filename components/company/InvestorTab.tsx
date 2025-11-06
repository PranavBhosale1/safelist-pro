import React from "react";

type Investor = {
  name?: string;
  type?: string;
  domain?: string;
};

type InvestorTabData = {
  companyDetails?: {
    result?: Array<{
      investorList?: Investor[];
    }>;
  };
};

export default function InvestorTab({ companyData }: { companyData: InvestorTabData }) {
  const investors = companyData?.companyDetails?.result?.[0]?.investorList || [];

  if (!investors.length) {
    return <p>No investors found.</p>;
  }

  return (
    <div className="space-y-4">
      <table className="min-w-full text-sm text-black border border-gray-400 mt-4">
        <thead className="bg-green-700 text-white">
          <tr>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Type</th>
            <th className="px-4 py-2 border">Website</th>
          </tr>
        </thead>
        <tbody>
          {investors.map((inv: Investor, index: number) => (
            <tr key={index} className="bg-white border-t">
              <td className="px-4 py-2 border font-medium">{inv?.name ?? "N/A"}</td>
              <td className="px-4 py-2 border">{inv?.type ?? "N/A"}</td>
              <td className="px-4 py-2 border">
                {inv?.domain ? (
                  <a
                    href={inv.domain.startsWith("http") ? inv.domain : `https://${inv.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 underline"
                  >
                    {inv.domain}
                  </a>
                ) : (
                  "N/A"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
