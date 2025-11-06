import React from "react";

type CompanyInsightsData = {
  companyDetails?: {
    result?: Array<{
      profileLinks?: Record<string, string | null>;
      companyRatings?: {
        editorRatingInfo?: { rating?: string | number };
        teamRatingInfo?: { rating?: string | number };
        marketSizeRatingInfo?: { rating?: string | number };
        soonicornClubInfo?: {
          latestSoonicornClubInfo?: {
            rating?: string | number;
            day?: string | number;
            month?: string | number;
            year?: string | number;
          };
        };
      };
    }>;
  };
  mobileInfo?: {
    appCount?: number;
    totalDownloads?: number;
    totalReviews?: number;
    weightedNetRating?: number;
    reviews6MonthPercentGrowth?: number;
    reviews6MonthGrowth?: number;
  };
};

export default function CompanyInsightsTab({ companyData }: { companyData: CompanyInsightsData }) {
    const details = companyData?.companyDetails?.result?.[0] || {};

    const profileLinks = details?.profileLinks || {};
    const editorRating = details?.companyRatings?.editorRatingInfo;
    const teamRating = details?.companyRatings?.teamRatingInfo;
    const marketRating = details?.companyRatings?.marketSizeRatingInfo;
    const soonicornInfo = details?.companyRatings?.soonicornClubInfo?.latestSoonicornClubInfo;
    const mobileInfo = companyData?.mobileInfo || {};

    const hasProfileLinks = Object.values(profileLinks).some((val) => val);
    const hasRatings = editorRating?.rating || teamRating?.rating || marketRating?.rating;
    const hasSoonicornInfo = soonicornInfo?.rating || soonicornInfo?.day || soonicornInfo?.month || soonicornInfo?.year;
    const hasMobileInfo = mobileInfo?.appCount || mobileInfo?.totalDownloads || mobileInfo?.totalReviews || mobileInfo?.weightedNetRating;

    return (
        <div className="space-y-6">
            {/* Social/Profile Links */ }
            { hasProfileLinks && (
                <div>
                    <h3 className="text-lg font-semibold text-green-700 mb-2">Social & Profile Links</h3>
                    <ul className="space-y-1">
                        { ["amazon", "instagram", "youtube", "blog", "facebook", "linkedIn", "twitter"].map(
                            (key) =>
                                profileLinks?.[key] && (
                                    <li key={ key }>
                                        <strong className="capitalize">{ key }:</strong>{ " " }
                                        <a
                                            href={ profileLinks[key] }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-600 underline"
                                        >
                                            { profileLinks[key] }
                                        </a>
                                    </li>
                                )
                        ) }
                    </ul>
                </div>
            ) }

            {/* Ratings Section */ }
            { hasRatings && (
                <div>
                    <h3 className="text-lg font-semibold text-green-700 mb-2">Company Ratings</h3>
                    { editorRating?.rating && (
                        <div className="relative group w-fit">
                            <p className="cursor-help">
                                <strong>Editor Rating:</strong> { editorRating?.rating ?? "N/A" }
                            </p>

                            <div className="absolute bottom-1/2 left-0 mb-2 hidden w-max rounded bg-green-800 px-2 py-1 text-xs text-white group-hover:block z-20">
                                Rating given by analysts 
                            </div>
                        </div>


                    ) }
                    { teamRating?.rating && (
                        <div className="relative group w-fit">
                            <p className="cursor-help">
                                <strong>Team Rating:</strong> { teamRating?.rating ?? "N/A" }
                            </p>

                            <div className="absolute bottom-1/2 left-0 mb-2 hidden w-max rounded bg-white/10 backdrop-blur-sm px-2 py-1 text-xs text-white group-hover:block z-20">
                               Gives details about the rating of a company&apos;s core team
                            </div>
                        </div>
                    ) }
                    { marketRating?.rating && (
                        <div className="relative group w-fit">
                            <p className="cursor-help">
                                <strong>Market Size Rating:</strong> { marketRating?.rating ?? "N/A" }
                            </p>

                            <div className="absolute bottom-1/2 left-0 mb-2 hidden w-max rounded bg-white/10 backdrop-blur-sm px-2 py-1 text-xs text-white group-hover:block z-20">
                               Company&apos;s business market as rated by our Analyst based on its size
                            </div>
                        </div>
                    ) }
                </div>
            ) }

            {/* Soonicorn Info */ }
            { hasSoonicornInfo && (
                <div>
                     <div className="relative group w-fit">
                    <h3 className="text-lg font-semibold text-green-700 mb-2">Soonicorn Club</h3>
                      <div className="absolute bottom-1/2 left-0 mb-2 hidden w-max rounded bg-white/10 backdrop-blur-sm px-2 py-1 text-xs text-white group-hover:block z-20">
                               Company&apos;s business market as rated by our Analyst based on its size
                            </div>
                        </div>

                    <p><strong>Rating:</strong> { soonicornInfo.rating ?? "N/A" }</p>
                    { (soonicornInfo.day || soonicornInfo.month || soonicornInfo.year) && (
                        <p>
                            <strong>Event Date:</strong>{ " " }
                            { soonicornInfo.day ?? "??" }/{ soonicornInfo.month ?? "??" }/{ soonicornInfo.year ?? "??" }
                        </p>
                    ) }
                </div>
            ) }

            {/* Mobile Info */ }
            { hasMobileInfo && (
                <div>
                    <h3 className="text-lg font-semibold text-green-700 mb-2">Mobile App Insights</h3>
                    { mobileInfo.appCount != null && <p><strong>Total Apps:</strong> { mobileInfo.appCount }</p> }
                    { mobileInfo.totalDownloads != null && <p><strong>Total Downloads:</strong> { mobileInfo.totalDownloads }</p> }
                    { mobileInfo.totalReviews != null && <p><strong>Total Reviews:</strong> { mobileInfo.totalReviews }</p> }
                    { mobileInfo.weightedNetRating != null && <p><strong>Net Rating (Weighted):</strong> { mobileInfo.weightedNetRating }</p> }
                    { mobileInfo.reviews6MonthPercentGrowth != null && <p><strong>6M Review Growth (%):</strong> { mobileInfo.reviews6MonthPercentGrowth }</p> }
                    { mobileInfo.reviews6MonthGrowth != null && <p><strong>6M Review Growth (Raw):</strong> { mobileInfo.reviews6MonthGrowth }</p> }
                </div>
            ) }
        </div>
    );
}
