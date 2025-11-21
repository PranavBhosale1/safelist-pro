"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Users, Building2, Star, ArrowUpRight,  Plus, Check, X, Search } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';

type CompanyInfographicProps = {
  className?: string;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showRateLimitNotice?: boolean;
};

type CompanyInfo = {
  name: string;
  logo: string;
  location: string;
  rating: string | number;
  url: string;
  domain?: string;
};

type CompanyDetails = {
  name?: string;
  websiteInfo?: { url?: string };
  foundedYear?: number | string;
  location?: { city?: string; state?: string; country?: string };
  latestValuation?: { amount?: { value?: number | string; currency?: string } };
  latestAnnualRevenue?: { amount?: { value?: number | string; currency?: string } };
  latestEmployeeCount?: { value?: number };
  employeeInfo?: { employeeList?: Array<{ id?: string }> };
  companyRatings?: {
    editorRatingInfo?: { rating?: string | number };
  };
  totalEquityFunding?: { amount?: { USD?: { value?: number } } };
  totalMoneyRaised?: { totalAmount?: { amount?: number; currency?: string } };
  newsInfo?: {
    totalArticles?: number;
    numberOfNewsArticlesLastYearDelta?: number;
  };
  // Optional freeform description field (used by mock data as { long: string })
  description?: {
    long?: string;
    short?: string;
  };
};

type FundingRound = {
  fundingDate?: {
    day?: string;
    month?: string;
    year?: string;
  };
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
};

type CompanyData = {
  company: CompanyInfo;
  details?: CompanyDetails;
  fundingRounds?: FundingRound[];
  status: 'loading' | 'loaded' | 'error';
};

// Cybersecurity companies only - API restrictions limit us to cybersecurity companies
// Rate limits are very restrictive, so we use sequential fetching with delays
const SUGGESTED_COMPANIES = [
  'CrowdStrike',
  'Palo Alto Networks',
  'Fortinet',
  'Check Point',
  'Zscaler',
  'Okta',
  'Rapid7',
  'SentinelOne',
  'Qualys',
  'Tenable',
  'FireEye',
  'Splunk',
  'Darktrace',
  'Varonis',
  'Proofpoint',
];

const STORAGE_KEY = 'tracked_companies';

export default function CompanyInfographic({
  className,
  title = 'Company Trends & Insights',
  subtitle = 'Live data from Tracxn',
  showHeader = true,
  showRateLimitNotice = true,
}: CompanyInfographicProps) {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(false); // Set to false since active tracking is disabled
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [trackedCompanies, setTrackedCompanies] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CompanyInfo[]>([]);
  const [searching, setSearching] = useState(false);
  const [verifiedCompanies, setVerifiedCompanies] = useState<CompanyInfo[]>([]);
  const [verifyingCompanies, setVerifyingCompanies] = useState(false);
  const router = useRouter();
  const containerClasses = cn('space-y-6', className);
  const trackButton = (
    <Button
      onClick={() => setShowDialog(true)}
      variant="outline"
      size="sm"
      className="gap-2 text-sm font-medium"
    >
      <Plus className="h-4 w-4" />
      Manage companies
    </Button>
  );

  // Load tracked companies from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTrackedCompanies(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved companies:', e);
      }
    }
    // Default to only first 2-3 companies due to strict rate limits
    // Users can add more, but we start with fewer to avoid rate limit issues
    setTrackedCompanies(SUGGESTED_COMPANIES.slice(0, 3));
  }, []);

  // Reset verified companies when dialog closes
  useEffect(() => {
    if (!showDialog) {
      setVerifiedCompanies([]);
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [showDialog]);

  // Verify and load suggested companies from Tracxn when dialog opens
  useEffect(() => {
    if (!showDialog) return;

    const verifySuggestedCompanies = async () => {
      setVerifyingCompanies(true);
      const verified: CompanyInfo[] = [];

      // Process companies sequentially with delay to avoid rate limiting
      // Check localStorage cache first
      const cacheKey = 'verified_companies_cache';
      const cacheExpiry = 1000 * 60 * 60; // 1 hour cache
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const { companies: cachedCompanies, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < cacheExpiry) {
            setVerifiedCompanies(cachedCompanies);
            setVerifyingCompanies(false);
            return;
          }
        } catch (e) {
          // Invalid cache, continue with verification
        }
      }

      // Process companies sequentially with significant delays to respect strict rate limits
      // Rate limits are very restrictive, so we use long delays
      for (const companyName of SUGGESTED_COMPANIES) {
        try {
          const res = await fetch(`/api/traxcn_card?name=${encodeURIComponent(companyName)}`);
          
          if (res.status === 429) {
            // Rate limited - wait much longer and skip this batch
            console.log(`Rate limited for "${companyName}". API rate limits are too restrictive.`);
            // Skip remaining companies if we hit rate limit
            break;
          }
          
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0 && data[0].name) {
              verified.push(data[0]);
            }
          }
          
          // Add significant delay between requests (5 seconds) due to very restrictive rate limits
          await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay between requests
        } catch (error) {
          console.log(`Company "${companyName}" not found in Tracxn`);
          // Continue to next company
        }
      }

      // Cache verified companies
      if (verified.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify({
          companies: verified,
          timestamp: Date.now()
        }));
      }

      setVerifiedCompanies(verified);
      setVerifyingCompanies(false);
    };

    verifySuggestedCompanies();
  }, [showDialog]);

  // Save tracked companies to localStorage
  useEffect(() => {
    if (trackedCompanies.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trackedCompanies));
    }
  }, [trackedCompanies]);

  // Load mock company data for dashboard display
  useEffect(() => {
    const loadMockCompanies = async () => {
      if (trackedCompanies.length === 0) return;
      
      console.log("📦 Loading company data for dashboard...");
      setLoading(true);
      
      try {
        const { searchMockCompanies, getMockFundingRounds } = await import('@/lib/mockData/companies');
        const fetchedCompanies: CompanyData[] = [];
        
        // Load data for tracked companies (use mock data as primary source)
        for (const companyName of trackedCompanies.slice(0, 6)) { // Limit to 6 for performance
          try {
            // Search mock data by company name
            const mockResults = searchMockCompanies(companyName);
            
            if (mockResults.length > 0) {
              const mockCompany = mockResults[0];
              const domain = mockCompany.domain;
              
              const companyData: CompanyData = {
                company: {
                  name: mockCompany.name,
                  location: `${mockCompany.location.city || ''}${mockCompany.location.city && mockCompany.location.country ? ', ' : ''}${mockCompany.location.country}`.trim() || 'N/A',
                  rating: mockCompany.rating,
                  url: mockCompany.url,
                  logo: mockCompany.logo,
                  domain: mockCompany.domain,
                },
                details: {
                  name: mockCompany.name,
                  websiteInfo: { url: mockCompany.url },
                  foundedYear: mockCompany.foundedYear,
                  location: mockCompany.location,
                  latestValuation: mockCompany.latestValuation,
                  latestAnnualRevenue: mockCompany.latestAnnualRevenue,
                  latestEmployeeCount: mockCompany.latestEmployeeCount,
                  companyRatings: mockCompany.companyRatings,
                  totalMoneyRaised: mockCompany.totalMoneyRaised,
                  description: mockCompany.description ? { long: mockCompany.description } : undefined,
                },
                fundingRounds: getMockFundingRounds(domain),
                status: 'loaded',
              };
              
              fetchedCompanies.push(companyData);
            } else {
              // If not found in mock data, try API as fallback
              try {
                const searchRes = await fetch(`/api/traxcn_card?name=${encodeURIComponent(companyName)}`);
                if (searchRes.ok) {
                  const searchData = await searchRes.json();
                  if (Array.isArray(searchData) && searchData.length > 0) {
                    const companyInfo = searchData[0];
                    if (companyInfo.url) {
                      const domain = companyInfo.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
                      const detailsRes = await fetch(`/api/traxcn_info?CompanyName=${encodeURIComponent(domain)}`);
                      if (detailsRes.ok) {
                        const detailsData = await detailsRes.json();
                        const companyData: CompanyData = {
                          company: companyInfo,
                          details: detailsData?.results?.companyDetails?.result?.[0],
                          fundingRounds: detailsData?.results?.fundingRounds?.result || [],
                          status: 'loaded',
                        };
                        fetchedCompanies.push(companyData);
                      }
                    }
                  }
                }
              } catch (apiError) {
                console.warn(`API fallback failed for ${companyName}:`, apiError);
              }
            }
          } catch (error) {
            console.warn(`Failed to load data for ${companyName}:`, error);
          }
        }
        
        setCompanies(fetchedCompanies);
        setLoading(false);
      } catch (error) {
        console.error('Error loading companies:', error);
        setLoading(false);
      }
    };
    
    loadMockCompanies();
  }, [trackedCompanies]);

  // Fetch companies data with rate limiting
  // DISABLED: Active company tracking is disabled
  // useEffect(() => {
  //   if (trackedCompanies.length === 0) return;
  //   
  //   const fetchCompanies = async () => {
  //     setLoading(true);
  //     
  //     // Process companies sequentially with delays to avoid rate limiting
  //     const fetchedCompanies: CompanyData[] = [];
  //     
  //     for (let i = 0; i < trackedCompanies.length; i++) {
  //       const companyName = trackedCompanies[i];
  //       try {
  //         // Step 1: Search for company
  //         let searchRes = await fetch(`/api/traxcn_card?name=${encodeURIComponent(companyName)}`);
  //         
  //         if (!searchRes.ok) {
  //           // If it's a 404, the company wasn't found - that's okay, skip it
  //           if (searchRes.status === 404) {
  //             console.log(`Company "${companyName}" not found, skipping...`);
  //             continue;
  //           }
  //           // Handle rate limiting (429) - very restrictive, so wait longer
  //           if (searchRes.status === 429) {
  //             console.warn(`Rate limited for ${companyName}. API rate limits are too restrictive.`);
  //             // Wait longer before retry
  //             await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
  //             // Retry once
  //             searchRes = await fetch(`/api/traxcn_card?name=${encodeURIComponent(companyName)}`);
  //             if (!searchRes.ok || searchRes.status === 429) {
  //               console.warn(`Retry failed for ${companyName} due to rate limits, skipping...`);
  //               continue;
  //             }
  //           } else {
  //             // For other errors, log and skip
  //             console.warn(`Error fetching ${companyName}: ${searchRes.status} ${searchRes.statusText}`);
  //             continue;
  //           }
  //         }
  //         
  //         let searchData: CompanyInfo[] | { error?: string };
  //         try {
  //           searchData = await searchRes.json();
  //         } catch (jsonError) {
  //           console.error(`Failed to parse JSON for ${companyName}:`, jsonError);
  //           continue;
  //         }
  //         
  //         // Check if response contains an error
  //         if (searchData && typeof searchData === 'object' && 'error' in searchData) {
  //           console.log(`API returned error for "${companyName}": ${searchData.error}`);
  //           continue;
  //         }
  //         
  //         // Validate it's an array with data
  //         if (!Array.isArray(searchData) || searchData.length === 0) {
  //           console.log(`No results found for "${companyName}"`);
  //           continue;
  //         }

  //         // Now TypeScript knows searchData is an array
  //         const companyInfoArray: CompanyInfo[] = searchData;
  //         const companyInfo = companyInfoArray[0];
  //         
  //         // Validate company info has required fields
  //         if (!companyInfo.name) {
  //           console.warn(`Invalid company data for ${companyName}, skipping...`);
  //           continue;
  //         }
  //         
  //         // Step 2: Get detailed info (optional - don't fail if this doesn't work)
  //         let companyData: CompanyData = {
  //           company: companyInfo,
  //           status: 'loaded' as const,
  //         };

  //         if (companyInfo.url) {
  //           try {
  //             // Extract domain from URL (remove protocol, www, and path)
  //             let domain = companyInfo.url
  //               .replace(/^https?:\/\//, '')
  //               .replace(/^www\./, '')
  //               .split('/')[0]
  //               .split('?')[0]; // Remove query params
  //             
  //             if (domain) {
  //               const detailsRes = await fetch(`/api/traxcn_info?CompanyName=${encodeURIComponent(domain)}`);
  //               
  //               if (detailsRes.ok) {
  //                 try {
  //                   const detailsData = await detailsRes.json();
  //                   companyData = {
  //                     company: companyInfo,
  //                     details: detailsData?.results?.companyDetails?.result?.[0],
  //                     fundingRounds: detailsData?.results?.fundingRounds?.result || [],
  //                     status: 'loaded' as const,
  //                   };
  //                 } catch (jsonError) {
  //                   console.warn(`Failed to parse details JSON for ${companyName}:`, jsonError);
  //                   // Continue with basic info
  //                 }
  //               }
  //             }
  //           } catch (detailsError) {
  //             // If details fetch fails, still use basic company info
  //             console.warn(`Failed to fetch details for ${companyName}:`, detailsError);
  //           }
  //         }

  //         fetchedCompanies.push(companyData);
  //         
  //         // Add significant delay between requests due to very restrictive rate limits
  //         // Only fetch 1-2 companies at a time to avoid hitting limits
  //         if (i < trackedCompanies.length - 1) {
  //           await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay between requests
  //         }
  //       } catch (error) {
  //         console.error(`Unexpected error fetching ${companyName}:`, error);
  //         // Continue to next company
  //       }
  //     }

  //     setCompanies(fetchedCompanies);
  //     setLoading(false);
  //   };

  //   fetchCompanies();
  // }, [trackedCompanies]);

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/traxcn_card?name=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setSearchResults(data.slice(0, 10)); // Limit to 10 results
          } else {
            setSearchResults([]);
          }
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const addCompany = (companyName: string) => {
    if (!trackedCompanies.includes(companyName)) {
      setTrackedCompanies([...trackedCompanies, companyName]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeCompany = (companyName: string) => {
    setTrackedCompanies(trackedCompanies.filter(name => name !== companyName));
  };

  const addFromSearch = (company: CompanyInfo) => {
    if (!trackedCompanies.includes(company.name)) {
      addCompany(company.name);
    }
  };

  const formatCurrency = (value?: number | string, currency?: string) => {
    if (!value) return 'N/A';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return 'N/A';
    
    const currencySymbol = currency === 'USD' ? '$' : currency === 'INR' ? '₹' : '';
    if (num >= 1000000000) return `${currencySymbol}${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `${currencySymbol}${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${currencySymbol}${(num / 1000).toFixed(2)}K`;
    return `${currencySymbol}${num.toFixed(0)}`;
  };

  const getLatestFunding = (rounds?: FundingRound[]) => {
    if (!rounds || rounds.length === 0) return null;
    const sorted = [...rounds].sort((a, b) => {
      const aYear = parseInt(a.fundingDate?.year || '0');
      const bYear = parseInt(b.fundingDate?.year || '0');
      return bYear - aYear;
    });
    return sorted[0];
  };

  const handleCardClick = (company: CompanyInfo) => {
    const params = new URLSearchParams({
      name: company.name,
      location: company.location,
      rating: String(company.rating),
      url: company.url,
      logo: company.logo,
    });
    router.push(`/company_info?${params}`);
  };

  if (loading) {
    return (
      <div className={containerClasses}>
        {(showHeader || showRateLimitNotice) && (
          <div className="space-y-3">
            {showHeader ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                  {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                </div>
                {trackButton}
              </div>
            ) : (
              <div className="flex justify-end">{trackButton}</div>
            )}
            {showRateLimitNotice && (
              <div className="flex items-start gap-3 rounded-xl border border-dashed border-amber-200 bg-amber-50/80 p-3">
                <span className="text-base">⚠️</span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-amber-900">API rate limits</p>
                  <p className="text-xs text-amber-700">
                    Data loads slowly (about five seconds per company). Track up to three companies at a time for reliable results.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(Math.max(3, trackedCompanies.length || 6))].map((_, i) => (
            <Card key={i} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm animate-pulse">
              <CardHeader className="space-y-2 p-0">
                <div className="h-5 w-3/4 rounded bg-gray-100" />
                <div className="h-4 w-1/2 rounded bg-gray-100" />
              </CardHeader>
              <CardContent className="mt-4 space-y-3 p-0">
                <div className="h-24 rounded-xl bg-gray-50" />
                <div className="space-y-2">
                  <div className="h-4 rounded bg-gray-100" />
                  <div className="h-4 w-2/3 rounded bg-gray-100" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {(showHeader || showRateLimitNotice) && (
        <div className="space-y-3">
          {showHeader ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
              </div>
              {trackButton}
            </div>
          ) : (
            <div className="flex justify-end">{trackButton}</div>
          )}
          {showRateLimitNotice && (
            <div className="flex items-start gap-3 rounded-xl border border-dashed border-amber-200 bg-amber-50/80 p-3">
              <span className="text-base">⚠️</span>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-900">API rate limits</p>
                <p className="text-xs text-amber-700">
                  Data loads slowly (about five seconds per company). Track up to three companies at a time for reliable results.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((companyData, index) => {
          const { company, details, fundingRounds } = companyData;
          const latestFunding = getLatestFunding(fundingRounds);
          const valuation = details?.latestValuation?.amount?.value;
          const revenue = details?.latestAnnualRevenue?.amount?.value;
          const employees = details?.latestEmployeeCount?.value;
          const newsDelta = details?.newsInfo?.numberOfNewsArticlesLastYearDelta;
          const rating = details?.companyRatings?.editorRatingInfo?.rating || company.rating;

          return (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
            >
              <Card
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-green-200 hover:shadow-md"
                onClick={() => handleCardClick(company)}
              >
                <CardHeader className="border-b border-gray-100 p-0 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-inset ring-gray-200">
                        {company.logo && !imageErrors.has(company.name) ? (
                          <Image
                            src={company.logo}
                            alt={company.name}
                            width={48}
                            height={48}
                            className="h-8 w-8 object-contain"
                            onError={() => {
                              setImageErrors((prev) => new Set(prev).add(company.name));
                            }}
                          />
                        ) : (
                          <Building2 className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate text-base font-semibold text-gray-900 transition-colors group-hover:text-green-700">
                          {company.name}
                        </CardTitle>
                        <p className="truncate text-xs text-gray-500">
                          {company.location || details?.location?.city || 'Location unavailable'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {rating && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                          <Star className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                          {rating}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCompany(company.name);
                        }}
                        className="rounded-full border border-transparent p-1.5 text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        title="Remove company"
                        aria-label={`Remove ${company.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 p-0 pt-4">
                  {latestFunding && (
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                            <TrendingUp className="h-4 w-4" />
                          </span>
                          <div>
                            <span className="text-xs font-medium text-gray-600">Latest funding</span>
                            <div className="mt-1 text-lg font-semibold text-gray-900">
                              {formatCurrency(latestFunding.amount?.amount, latestFunding.amount?.currency)}
                            </div>
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {latestFunding.fundingDate?.year || 'Recent activity'}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {valuation && (
                      <div className="rounded-xl border border-gray-100 bg-white p-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <DollarSign className="h-3 w-3" />
                          </span>
                          <span className="font-medium text-gray-600">Valuation</span>
                        </div>
                        <div className="mt-2 text-sm font-semibold text-gray-900">
                          {formatCurrency(valuation, details?.latestValuation?.amount?.currency)}
                        </div>
                      </div>
                    )}

                    {employees && (
                      <div className="rounded-xl border border-gray-100 bg-white p-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                            <Users className="h-3 w-3" />
                          </span>
                          <span className="font-medium text-gray-600">Employees</span>
                        </div>
                        <div className="mt-2 text-sm font-semibold text-gray-900">
                          {employees >= 1000 ? `${(employees / 1000).toFixed(1)}K` : employees}
                        </div>
                      </div>
                    )}

                    {revenue && (
                      <div className="rounded-xl border border-gray-100 bg-white p-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                            <TrendingUp className="h-3 w-3" />
                          </span>
                          <span className="font-medium text-gray-600">Revenue</span>
                        </div>
                        <div className="mt-2 text-sm font-semibold text-gray-900">
                          {formatCurrency(revenue, details?.latestAnnualRevenue?.amount?.currency)}
                        </div>
                      </div>
                    )}

                    {newsDelta !== undefined && (
                      <div className="rounded-xl border border-gray-100 bg-white p-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded-lg',
                              newsDelta >= 0 ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'
                            )}
                          >
                            {newsDelta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          </span>
                          <span className="font-medium text-gray-600">News momentum</span>
                        </div>
                        <div
                          className={cn(
                            'mt-2 text-sm font-semibold',
                            newsDelta >= 0 ? 'text-green-600' : 'text-rose-600'
                          )}
                        >
                          {newsDelta >= 0 ? '+' : ''}
                          {newsDelta}%
                        </div>
                      </div>
                    )}
                  </div>

                  {details?.totalEquityFunding?.amount?.USD?.value && (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-white p-3 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Total equity funding</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(details.totalEquityFunding.amount.USD.value, 'USD')}
                        </span>
                      </div>
                    </div>
                  )}

                  {details?.foundedYear && (
                    <p className="text-xs text-gray-500">Founded {details.foundedYear}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {companies.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center text-sm text-gray-600">
          No company data available right now.
        </div>
      )}

      {/* Company Selection Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Track Companies</DialogTitle>
            <DialogDescription>
              Search and select cybersecurity companies to track. Due to API restrictions, only cybersecurity companies are available.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 -mt-2">
            <p className="text-xs text-amber-800">
              <strong>⚠️ API Rate Limits:</strong> API rate limits are extremely restrictive. Only add 1-2 companies at a time to avoid errors. 
              Verification may take 5+ seconds per company. Only cybersecurity companies are available.
            </p>
          </div>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search for cybersecurity companies..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                className="pl-10"
              />
            </div>

            {/* Currently Tracked Companies */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Currently Tracking ({trackedCompanies.length})</h3>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {trackedCompanies.map((name) => (
                    <motion.div
                      key={name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      <Check className="w-3 h-3" />
                      {name}
                      <button
                        onClick={() => removeCompany(name)}
                        className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Search Results */}
            {searching && (
              <div className="text-center py-4 text-gray-500">Searching...</div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">Search Results</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((company) => {
                    const isTracked = trackedCompanies.includes(company.name);
                    return (
                      <motion.div
                        key={company.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                          isTracked
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
                        }`}
                      >
                        {company.logo && !imageErrors.has(company.name) ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                            <Image
                              src={company.logo}
                              alt={company.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                              onError={() => {
                                setImageErrors(prev => new Set(prev).add(company.name));
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-green-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{company.name}</div>
                          <div className="text-xs text-gray-500 truncate">{company.location}</div>
                        </div>
                        {company.rating && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            {company.rating}
                          </div>
                        )}
                        <button
                          onClick={() => {
                            if (isTracked) {
                              removeCompany(company.name);
                            } else {
                              addFromSearch(company);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            isTracked
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {isTracked ? 'Remove' : 'Add'}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Suggested Companies - Only show verified ones */}
            {searchResults.length === 0 && !searchQuery && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">
                  Suggested Companies
                  {verifyingCompanies && (
                    <span className="text-xs text-gray-500 ml-2">(verifying...)</span>
                  )}
                </h3>
                {verifyingCompanies && verifiedCompanies.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Checking available companies...
                  </div>
                ) : verifiedCompanies.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No suggested companies available at the moment.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {verifiedCompanies.map((company) => {
                      const isTracked = trackedCompanies.includes(company.name);
                      return (
                        <button
                          key={company.name}
                          onClick={() => {
                            if (isTracked) {
                              removeCompany(company.name);
                            } else {
                              addCompany(company.name);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                            isTracked
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {company.logo && !imageErrors.has(company.name) ? (
                            <img
                              src={company.logo}
                              alt={company.name}
                              className="w-4 h-4 rounded object-cover"
                              onError={() => {
                                setImageErrors(prev => new Set(prev).add(company.name));
                              }}
                            />
                          ) : null}
                          <span>{company.name}</span>
                          {isTracked && <Check className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowDialog(false)} variant="outline">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

