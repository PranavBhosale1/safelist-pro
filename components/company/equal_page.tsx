// app/company-info/page.tsx (or EqualCompanyPage.tsx)
"use client";
export const dynamic = 'force-dynamic';
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import OverviewTab from "@/components/company/OverviewTab";
import FundingTab from "@/components/company/FundingTab";
import InvestorTab from "@/components/company/InvestorTab";
import ContactTab from "@/components/company/ContactTab";
import CompanyInsightsTab from "@/components/company/CompanyInsightsTab";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from 'next/navigation'; 
import { motion } from 'framer-motion';
import { useSession } from "next-auth/react";
import { Menu, X } from 'lucide-react';


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

type CompanyDetails = {
  name?: string;
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
    totalArticles?: number;
    numberOfNewsArticlesLastYearDelta?: number;
    newsList?: {
      headLine?: string;
      publicationDate?: string;
      sourceUrl?: string;
    }[];
  };
  profileLinks?: Record<string, string>;
  companyRatings?: {
    editorRatingInfo?: { rating?: string | number };
    teamRatingInfo?: { rating?: string | number };
    marketSizeRatingInfo?: { rating?: string | number };
    soonicornClubInfo?: {
      latestSoonicornClubInfo?: {
        rating?: string | number;
        day?: number;
        month?: number;
        year?: number;
      };
    };
  };
  totalEquityFunding?: { amount?: { USD?: { value?: number } }; baseCurrency?: string };
  totalMoneyRaised?: { totalAmount?: { amount?: number; currency?: string } };
  investorList?: {
    name?: string;
    type?: string;
    domain?: string;
    id?: string;
    isLead?: boolean;
  }[];
  contactNumberList?: { countryCode?: string; number?: string }[];
  emailList?: { email?: string }[];
  // Add any other fields as needed
};

type CompanyData = {
  name?: string;
  companyDetails: { result: CompanyDetails[] };
  // Add other fields as needed
};

export default function EqualCompanyPage() {

    const searchParams = useSearchParams();
    const name = searchParams.get("name");
    const url = searchParams.get("url");
    const location = searchParams.get("location");
    const rating = searchParams.get("rating");
    const logo = searchParams.get("logo");
    const [activeTab, setActiveTab] = useState("overview");
    const [companyData, setCompanyData] = useState<CompanyData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { status } = useSession();
    const [showMobileTabs, setShowMobileTabs] = useState(false);
    useEffect(() => {
      if (status === "unauthenticated") {
        router.replace("/auth/signup"); // or "/auth/signin"
      }
    }, [status, router]);
    useEffect(() => {
        if (!name) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/traxcn?name=${encodeURIComponent(name)}`);
                const data = await res.json();
                const details = data.results;
                if (!details) throw new Error("Company not found");
                setCompanyData(details);
            } catch (error) {
                console.error("Error fetching company data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [name]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black p-6 flex items-center justify-center">
        {/* Loading Skeleton (green / white theme) */}
        <div className="w-full max-w-5xl space-y-6 animate-pulse">
          <div className="h-10 w-1/3 bg-white rounded-lg mb-6" />
          <div className="flex rounded-xl bg-white shadow-[0_0_24px_4px_#10B98120] p-6 gap-6 items-center border border-green-50">
            <div className="h-24 w-24 bg-green-100 rounded-md" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-1/2 bg-green-100 rounded" />
              <div className="h-4 w-1/3 bg-green-100 rounded" />
              <div className="h-4 w-1/4 bg-green-100 rounded" />
              <div className="h-4 w-1/5 bg-green-100 rounded" />
            </div>
            <div className="h-10 w-24 bg-green-100 rounded-lg ml-6" />
          </div>
          <div className="flex gap-4 mb-6">
            {['Overview', 'Funding', 'Investor', 'Contact', 'Insights'].map((tab) => (
              <div key={tab} className="h-10 w-24 bg-green-50 rounded-lg border border-green-100" />
            ))}
          </div>
          <div className="h-64 w-full bg-green-50 rounded-xl border border-green-100" />
        </div>
      </div>
    );
  }

    if (!companyData) {
        return <div className="text-red-500 p-6">Failed to load company data.</div>;
    }

    const handleClickBuy = () => {
        router.push(`/dashboard/buy?name=${encodeURIComponent(name)}`); // Adjust the path as needed
    };

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-black text-green-700 mb-2"
        >
          {companyData.name}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex rounded-xl bg-white shadow-[0_0_24px_4px_#10B98120] items-center border border-green-50"
        >
          <div className="w-full flex p-6 items-center gap-6">
            <div className="flex-shrink-0 h-24 w-24 relative">
              <Image
                src={logo}
                alt={name}
                layout="fill"
                objectFit="contain"
                className="rounded-md"
              />
            </div>
            {/* Text Content Section */}
            <div className="flex flex-col justify-between h-full">
              <h2 className="text-2xl font-bold text-green-700">{name}</h2>
              <p className="text-sm text-gray-600 mt-1">{location}</p>
              <p className="text-sm mt-1 text-gray-700">⭐ Rating: {rating}</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 underline text-sm mt-1"
              >
                Visit Website
              </a>
            </div>
          </div>
          {/* Logo Section */}
          <div className="flex justify-between items-center ml-6">
            <button
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-[0_0_12px_2px_#10B98140] hover:scale-105 transition-all mr-4"
              onClick={handleClickBuy}
            >
              Buy
            </button>
          </div>
        </motion.div>
                {/* Tab Buttons */}
                <div className="flex md:hidden mb-4">
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#38bdf8] text-white font-semibold shadow-[0_0_8px_1px_#7c3aed20] border-2 border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
                    onClick={() => setShowMobileTabs(true)}
                  >
                    <Menu className="w-5 h-5" />
                    Tabs
                  </button>
                  {showMobileTabs && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur">
                      <div className="bg-[#18122B] border-2 border-[#7c3aed] rounded-2xl shadow-2xl p-6 w-11/12 max-w-xs mx-auto relative flex flex-col gap-4">
                        <button
                          className="absolute top-3 right-3 text-white hover:text-[#7c3aed] focus:outline-none"
                          onClick={() => setShowMobileTabs(false)}
                          aria-label="Close tabs menu"
                        >
                          <X className="w-6 h-6" />
                        </button>
                        <Button
                          variant={activeTab === "overview" ? "default" : "outline"}
                          onClick={() => { setActiveTab("overview"); setShowMobileTabs(false); }}
                          className="text-lg px-6 py-2 rounded-lg font-semibold"
                        >
                          Overview
                        </Button>
                        <Button
                          variant={activeTab === "funding" ? "default" : "outline"}
                          onClick={() => { setActiveTab("funding"); setShowMobileTabs(false); }}
                          className="text-lg px-6 py-2 rounded-lg font-semibold"
                        >
                          Funding
                        </Button>
                        <Button
                          variant={activeTab === "investor" ? "default" : "outline"}
                          onClick={() => { setActiveTab("investor"); setShowMobileTabs(false); }}
                          className="text-lg px-6 py-2 rounded-lg font-semibold"
                        >
                          Investor
                        </Button>
                        <Button
                          variant={activeTab === "contact" ? "default" : "outline"}
                          onClick={() => { setActiveTab("contact"); setShowMobileTabs(false); }}
                          className="text-lg px-6 py-2 rounded-lg font-semibold"
                        >
                          Contact
                        </Button>
                        <Button
                          variant={activeTab === "insights" ? "default" : "outline"}
                          onClick={() => { setActiveTab("insights"); setShowMobileTabs(false); }}
                          className="text-lg px-6 py-2 rounded-lg font-semibold"
                        >
                          Insights
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="hidden md:flex gap-4 mb-4">
                  <Button
                    variant={activeTab === "overview" ? "default" : "outline"}
                    onClick={() => setActiveTab("overview")}
                    className="text-lg px-6 py-2 rounded-lg font-semibold"
                  >
                    Overview
                  </Button>
                  <Button
                    variant={activeTab === "funding" ? "default" : "outline"}
                    onClick={() => setActiveTab("funding")}
                    className="text-lg px-6 py-2 rounded-lg font-semibold"
                  >
                    Funding
                  </Button>
                  <Button
                    variant={activeTab === "investor" ? "default" : "outline"}
                    onClick={() => setActiveTab("investor")}
                    className="text-lg px-6 py-2 rounded-lg font-semibold"
                  >
                    Investor
                  </Button>
                  <Button
                    variant={activeTab === "contact" ? "default" : "outline"}
                    onClick={() => setActiveTab("contact")}
                    className="text-lg px-6 py-2 rounded-lg font-semibold"
                  >
                    Contact
                  </Button>
                  <Button
                    variant={activeTab === "insights" ? "default" : "outline"}
                    onClick={() => setActiveTab("insights")}
                    className="text-lg px-6 py-2 rounded-lg font-semibold"
                  >
                    Insights
                  </Button>
                </div>
                {/* Tab Content */}
                {activeTab === "overview" && <OverviewTab companyData={companyData.companyDetails.result[0]} />}
                {activeTab === "funding" && <FundingTab companyData={companyData} />}
                {activeTab === "investor" && <InvestorTab companyData={companyData} />}
                {activeTab === "contact" && <ContactTab companyData={companyData} />}
                {activeTab === "insights" && <CompanyInsightsTab companyData={companyData} />}
            </div>
        </div>
    );
}
