"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Users, Building2, Star, ArrowUpRight, ArrowDownRight, Plus, Check, X, Search } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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

export default function CompanyInfographic() {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [trackedCompanies, setTrackedCompanies] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CompanyInfo[]>([]);
  const [searching, setSearching] = useState(false);
  const [verifiedCompanies, setVerifiedCompanies] = useState<CompanyInfo[]>([]);
  const [verifyingCompanies, setVerifyingCompanies] = useState(false);
  const router = useRouter();

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

  // Fetch companies data with rate limiting
  useEffect(() => {
    if (trackedCompanies.length === 0) return;
    
    const fetchCompanies = async () => {
      setLoading(true);
      
      // Process companies sequentially with delays to avoid rate limiting
      const fetchedCompanies: CompanyData[] = [];
      
      for (let i = 0; i < trackedCompanies.length; i++) {
        const companyName = trackedCompanies[i];
        try {
          // Step 1: Search for company
          let searchRes = await fetch(`/api/traxcn_card?name=${encodeURIComponent(companyName)}`);
          
          if (!searchRes.ok) {
            // If it's a 404, the company wasn't found - that's okay, skip it
            if (searchRes.status === 404) {
              console.log(`Company "${companyName}" not found, skipping...`);
              continue;
            }
            // Handle rate limiting (429) - very restrictive, so wait longer
            if (searchRes.status === 429) {
              console.warn(`Rate limited for ${companyName}. API rate limits are too restrictive.`);
              // Wait longer before retry
              await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
              // Retry once
              searchRes = await fetch(`/api/traxcn_card?name=${encodeURIComponent(companyName)}`);
              if (!searchRes.ok || searchRes.status === 429) {
                console.warn(`Retry failed for ${companyName} due to rate limits, skipping...`);
                continue;
              }
            } else {
              // For other errors, log and skip
              console.warn(`Error fetching ${companyName}: ${searchRes.status} ${searchRes.statusText}`);
              continue;
            }
          }
          
          let searchData: CompanyInfo[] | { error?: string };
          try {
            searchData = await searchRes.json();
          } catch (jsonError) {
            console.error(`Failed to parse JSON for ${companyName}:`, jsonError);
            continue;
          }
          
          // Check if response contains an error
          if (searchData && typeof searchData === 'object' && 'error' in searchData) {
            console.log(`API returned error for "${companyName}": ${searchData.error}`);
            continue;
          }
          
          // Validate it's an array with data
          if (!Array.isArray(searchData) || searchData.length === 0) {
            console.log(`No results found for "${companyName}"`);
            continue;
          }

          // Now TypeScript knows searchData is an array
          const companyInfoArray: CompanyInfo[] = searchData;
          const companyInfo = companyInfoArray[0];
          
          // Validate company info has required fields
          if (!companyInfo.name) {
            console.warn(`Invalid company data for ${companyName}, skipping...`);
            continue;
          }
          
          // Step 2: Get detailed info (optional - don't fail if this doesn't work)
          let companyData: CompanyData = {
            company: companyInfo,
            status: 'loaded' as const,
          };

          if (companyInfo.url) {
            try {
              // Extract domain from URL (remove protocol, www, and path)
              let domain = companyInfo.url
                .replace(/^https?:\/\//, '')
                .replace(/^www\./, '')
                .split('/')[0]
                .split('?')[0]; // Remove query params
              
              if (domain) {
                const detailsRes = await fetch(`/api/traxcn_info?CompanyName=${encodeURIComponent(domain)}`);
                
                if (detailsRes.ok) {
                  try {
                    const detailsData = await detailsRes.json();
                    companyData = {
                      company: companyInfo,
                      details: detailsData?.results?.companyDetails?.result?.[0],
                      fundingRounds: detailsData?.results?.fundingRounds?.result || [],
                      status: 'loaded' as const,
                    };
                  } catch (jsonError) {
                    console.warn(`Failed to parse details JSON for ${companyName}:`, jsonError);
                    // Continue with basic info
                  }
                }
              }
            } catch (detailsError) {
              // If details fetch fails, still use basic company info
              console.warn(`Failed to fetch details for ${companyName}:`, detailsError);
            }
          }

          fetchedCompanies.push(companyData);
          
          // Add significant delay between requests due to very restrictive rate limits
          // Only fetch 1-2 companies at a time to avoid hitting limits
          if (i < trackedCompanies.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay between requests
          }
        } catch (error) {
          console.error(`Unexpected error fetching ${companyName}:`, error);
          // Continue to next company
        }
      }

      setCompanies(fetchedCompanies);
      setLoading(false);
    };

    fetchCompanies();
  }, [trackedCompanies]);

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
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Company Trends & Insights</h2>
              <span className="text-sm text-gray-500">Live data from Tracxn</span>
            </div>
            <Button
              onClick={() => setShowDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Track More Companies
            </Button>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>⚠️ API Rate Limits:</strong> API rate limits are extremely restrictive. Data loads slowly (5+ seconds per company). 
              Only cybersecurity companies are available. We recommend tracking 1-3 companies at a time.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(Math.max(3, trackedCompanies.length || 6))].map((_, i) => (
            <Card key={i} className="bg-white border-2 border-green-200 animate-pulse">
              <CardHeader>
                <div className="h-6 w-3/4 bg-green-100 rounded mb-2" />
                <div className="h-4 w-1/2 bg-green-50 rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-green-50 rounded-lg mb-4" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-green-50 rounded" />
                  <div className="h-4 w-2/3 bg-green-50 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Company Trends & Insights</h2>
            <span className="text-sm text-gray-500">Live data from Tracxn</span>
          </div>
          <Button
            onClick={() => setShowDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Track More Companies
          </Button>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            <strong>⚠️ API Rate Limits:</strong> API rate limits are extremely restrictive. Data loads slowly (5+ seconds per company). 
            Only cybersecurity companies are available. We recommend tracking 1-3 companies at a time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className="bg-white border-2 border-green-200 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
                onClick={() => handleCardClick(company)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-green-50 border-2 border-green-200 p-1 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {company.logo && !imageErrors.has(company.name) ? (
                          <Image
                            src={company.logo}
                            alt={company.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover rounded-lg"
                            onError={() => {
                              setImageErrors(prev => new Set(prev).add(company.name));
                            }}
                          />
                        ) : (
                          <Building2 className="w-full h-full text-green-600 p-2" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition truncate">
                          {company.name}
                        </CardTitle>
                        <p className="text-xs text-gray-500 truncate">{company.location || details?.location?.city || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {rating && (
                        <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-semibold text-gray-700">{rating}</span>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCompany(company.name);
                        }}
                        className="p-1.5 hover:bg-red-50 rounded-full transition-colors text-gray-400 hover:text-red-600"
                        title="Remove company"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Latest Funding */}
                  {latestFunding && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-semibold text-gray-700">Latest Funding</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(latestFunding.amount?.amount, latestFunding.amount?.currency)}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {latestFunding.fundingDate?.year || 'Recent'}
                      </div>
                    </div>
                  )}

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {valuation && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center gap-1 mb-1">
                          <DollarSign className="w-3 h-3 text-blue-600" />
                          <span className="text-xs text-gray-600">Valuation</span>
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(valuation, details?.latestValuation?.amount?.currency)}
                        </div>
                      </div>
                    )}

                    {employees && (
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center gap-1 mb-1">
                          <Users className="w-3 h-3 text-purple-600" />
                          <span className="text-xs text-gray-600">Employees</span>
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                          {employees >= 1000 ? `${(employees / 1000).toFixed(1)}K` : employees}
                        </div>
                      </div>
                    )}

                    {revenue && (
                      <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                        <div className="flex items-center gap-1 mb-1">
                          <TrendingUp className="w-3 h-3 text-orange-600" />
                          <span className="text-xs text-gray-600">Revenue</span>
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(revenue, details?.latestAnnualRevenue?.amount?.currency)}
                        </div>
                      </div>
                    )}

                    {newsDelta !== undefined && (
                      <div className={`rounded-lg p-3 border ${newsDelta >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center gap-1 mb-1">
                          {newsDelta >= 0 ? (
                            <TrendingUp className="w-3 h-3 text-green-600" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-600" />
                          )}
                          <span className="text-xs text-gray-600">News</span>
                        </div>
                        <div className={`text-sm font-bold ${newsDelta >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {newsDelta >= 0 ? '+' : ''}{newsDelta}%
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Total Funding */}
                  {details?.totalEquityFunding?.amount?.USD?.value && (
                    <div className="pt-2 border-t border-green-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Total Equity Funding</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(details.totalEquityFunding.amount.USD.value, 'USD')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Founded Year */}
                  {details?.foundedYear && (
                    <div className="text-xs text-gray-500">
                      Founded {details.foundedYear}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {companies.length === 0 && !loading && (
        <div className="text-center py-12 bg-green-50 rounded-xl border-2 border-green-200">
          <p className="text-gray-600">No company data available at the moment.</p>
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

