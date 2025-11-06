"use client";
import React, { useState } from "react";

type Investor = {
  id?: string;
  name?: string;
  domain?: string;
  type?: string;
  isLead?: boolean;
};

type FundingRound = {
  fundingDate?: {
    day?: string;
    month?: string;
    year?: string;
  };
  name?: string;
  amount?: {
    amount?: number;
    currency?: string;
  };
  postMoneyValuation?: {
    normalizedAmount?: {
      value?: number;
      currency?: string;
    };
  };
  investorList?: Investor[];
};

type FundingTabData = {
  fundingRounds?: {
    result?: FundingRound[];
  };
  companyDetails?: {
    result?: Array<{
      totalEquityFunding?: {
        amount?: {
          USD?: {
            value?: number;
          };
        };
        baseCurrency?: string;
      };
      totalMoneyRaised?: {
        totalAmount?: {
          amount?: number;
          currency?: string;
        };
      };
    }>;
  };
};

export default function FundingTab({ companyData }: { companyData: FundingTabData }) {
  const fundingRounds = companyData?.fundingRounds?.result || [];

  const [expandedRounds, setExpandedRounds] = useState<{ [key: number]: boolean }>({});

  const toggleInvestorTable = (index: number) => {
    setExpandedRounds((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (!fundingRounds.length) {
    return <p>No funding information available.</p>;
  }

  const totalFundingByEquity =
    companyData?.companyDetails?.result?.[0]?.totalEquityFunding?.amount?.USD?.value;
  const fundingCurrencyByEquity =
    companyData?.companyDetails?.result?.[0]?.totalEquityFunding?.baseCurrency;
  const totalFunding = companyData?.companyDetails?.result?.[0]?.totalMoneyRaised?.totalAmount?.amount;
  const fundingCurrency = companyData?.companyDetails?.result?.[0]?.totalMoneyRaised?.totalAmount?.currency;
    return (
    <div className="space-y-4">
      {totalFundingByEquity && fundingCurrencyByEquity && (
        <p>
          <strong>
            Total funding Till Date(by equity): {totalFundingByEquity} {fundingCurrencyByEquity}
          </strong>
        </p>
      )}
      {totalFunding && fundingCurrency && (
        <p>
          <strong>
            Total funding Till Date: {totalFunding} {fundingCurrency}
          </strong>
        </p>
      )}

      <p><strong>All Funding Rounds</strong></p>

      {fundingRounds.map((round: FundingRound, index: number) => {
        const date = round?.fundingDate
          ? `${round.fundingDate?.day || "??"}/${round.fundingDate?.month || "??"}/${round.fundingDate?.year || "??"}`
          : "Date N/A";

        return (
          <div key={index} className="border p-4 rounded bg-green-50 border-green-100">
            <p><strong>Date:</strong> {date}</p>
            <p><strong>Type:</strong> {round?.name || "N/A"}</p>
            <p>
              <strong>Amount:</strong>{" "}
              {round?.amount?.amount ?? 0} {round?.amount?.currency ?? ""}
            </p>
            <p>
              <strong>Post Money Valuation:</strong>{" "}
              {round?.postMoneyValuation?.normalizedAmount?.value ?? "N/A"}{" "}
              {round?.postMoneyValuation?.normalizedAmount?.currency ?? ""}
            </p>

            {round?.investorList?.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => toggleInvestorTable(index)}
                  className="text-sm text-green-700 underline"
                >
                  {expandedRounds[index] ? "Hide Investors ▲" : "Show Investors ▼"}
                </button>

                {expandedRounds[index] && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm text-black">
                      <thead className="bg-green-700 text-white">
                        <tr>
                          <th className="px-4 py-2 border">Name</th>
                          <th className="px-4 py-2 border">Domain</th>
                          <th className="px-4 py-2 border">Type</th>
                          <th className="px-4 py-2 border">Lead?</th>
                        </tr>
                      </thead>
                      <tbody>
                        {round.investorList.map((inv: Investor) => (
                          <tr key={inv?.id || `${index}-${inv?.name}`} className="bg-white border-t">
                            <td className="px-4 py-2 border font-semibold">
                              {inv?.name ?? "N/A"}
                            </td>
                            <td className="px-4 py-2 border">
                              {inv?.domain ? (
                                <a
                                  href={`https://${inv.domain}`}
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
                            <td className="px-4 py-2 border">{inv?.type ?? "N/A"}</td>
                            <td className="px-4 py-2 border">{inv?.isLead ? "Yes" : "No"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
