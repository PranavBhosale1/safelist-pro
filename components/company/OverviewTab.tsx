// components/company/OverviewTab.tsx
import React from "react";
import EmployeeTable from "@/components/emp_table";

type Employee = {
  id: string;
  name: string;
  designation: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  profileLinks?: {
    linkedinHandle?: string;
  };
  shortBio?: string;
};

type Article = {
  headLine?: string;
  publicationDate?: string;
  sourceUrl?: string;
};

type OverviewTabData = {
  websiteInfo?: { url?: string };
  mobileInfo?: { appCount?: number };
  foundedYear?: number | string;
  addresses?: { street?: string }[];
  location?: { state?: string; country?: string; continent?: string };
  isAcquired?: boolean;
  description?: { long?: string };
  latestValuation?: { amount?: { value?: number | string; currency?: string } };
  latestAnnualRevenue?: { amount?: { value?: number | string; currency?: string } };
  latestFinancialDomainEbitda?: { amount?: { value?: number | string; currency?: string } };
  latestFinancialDomainNetProfit?: { amount?: { value?: number | string; currency?: string } };
  latestEmployeeCount?: { value?: number };
  employeeInfo?: { employeeList?: Employee[] };
  newsInfo?: {
    newsList?: Article[];
    totalArticles?: number;
    numberOfNewsArticlesLastYearDelta?: number;
  };
};

export default function OverviewTab({ companyData }: { companyData: OverviewTabData }) {
   

  return (
    <div className="space-y-4">
      {/* Website */}
      {companyData?.websiteInfo?.url && (
        <p>
          <strong>Website:</strong>{" "}
          <a
            href={companyData.websiteInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 underline"
          >
            {companyData.websiteInfo.url}
          </a>
        </p>
      )}

      {/* Mobile App Users */}
      {companyData?.mobileInfo?.appCount !== undefined && (
        <p>
          <strong>Mobile App users:</strong> {companyData.mobileInfo.appCount}
        </p>
      )}

      {/* Founded */}
      {companyData?.foundedYear && (
        <p>
          <strong>Founded:</strong> {companyData.foundedYear}
        </p>
      )}

      {/* Address */}
      {(companyData?.addresses?.[0]?.street ||
        companyData?.location?.state ||
        companyData?.location?.country ||
        companyData?.location?.continent) && (
        <p>
          <strong>Address:</strong>{" "}
          {[companyData?.addresses?.[0]?.street, companyData?.location?.state, companyData?.location?.country, companyData?.location?.continent]
            .filter(Boolean)
            .join(", ")}
        </p>
      )}

      {/* Acquired */}
      {companyData?.isAcquired !== undefined && (
        <p>
          <strong>Acquired?:</strong> {companyData.isAcquired ? "Yes" : "No"}
        </p>
      )}

      {/* Description */}
      {companyData?.description?.long && (
        <p>
          <strong>Description:</strong> {companyData.description.long}
        </p>
      )}

      {/* Valuation */}
      {companyData?.latestValuation?.amount?.value && (
        <p>
          <strong>Valuation:</strong>{" "}
          {companyData.latestValuation.amount.value}{" "}
          {companyData.latestValuation.amount.currency ?? ""}
        </p>
      )}

      {/* Annual Revenue */}
      {companyData?.latestAnnualRevenue?.amount?.value && (
        <p>
          <strong>Annual Revenue:</strong>{" "}
          {companyData.latestAnnualRevenue.amount.value}{" "}
          {companyData.latestAnnualRevenue.amount.currency ?? ""}
        </p>
      )}

      {/* EBITDA */}
      {companyData?.latestFinancialDomainEbitda?.amount?.value && (
        <p>
          <strong>EBITDA:</strong>{" "}
          {companyData.latestFinancialDomainEbitda.amount.value}{" "}
          {companyData.latestFinancialDomainEbitda.amount.currency ?? ""}
        </p>
      )}

      {/* Profit */}
      {companyData?.latestFinancialDomainNetProfit?.amount?.value && (
        <p>
          <strong>Profit:</strong>{" "}
          {companyData.latestFinancialDomainNetProfit.amount.value}{" "}
          {companyData.latestFinancialDomainNetProfit.amount.currency ?? ""}
        </p>
      )}

      {/* Employee Count */}
      {companyData?.latestEmployeeCount?.value && (
        <p>
          <strong>Employee count:</strong> {companyData.latestEmployeeCount.value}
        </p>
      )}

      {/* Employees Table */}
      {companyData?.employeeInfo?.employeeList?.length > 0 && (
        <EmployeeTable employees={companyData.employeeInfo.employeeList} />
      )}

      {/* News Section */}
      {companyData?.newsInfo?.newsList?.length > 0 && (
        <div>
          <p>
            <strong>News:</strong>{" "}
            total articles: {companyData.newsInfo.totalArticles ?? 0} | articles last year:{" "}
            {companyData.newsInfo.numberOfNewsArticlesLastYearDelta ?? 0}
          </p>

          <ul className="space-y-4 mt-2">
            {companyData.newsInfo.newsList.map((article: Article, index: number) => (
              <li
                  key={index}
                  className="bg-green-50 p-4 rounded-md border border-green-100"
                >
                  <p className="text-sm text-gray-700">
                    {article?.headLine ?? "No headline"} —{" "}
                    {article?.publicationDate
                      ? new Date(article.publicationDate).toLocaleDateString()
                      : "Unknown date"}
                  </p>
                  {article?.sourceUrl ? (
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline text-lg font-medium"
                    >
                      Link
                    </a>
                  ) : (
                    <span className="text-gray-500">No link</span>
                  )}
                </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
