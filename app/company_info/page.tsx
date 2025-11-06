// app/company_info/page.tsx
import { Suspense } from 'react';
import EqualCompanyPage from '@/components/company/equal_page';

export default function CompanyInfoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white text-black p-6 flex items-center justify-center">
          <div className="w-full max-w-5xl space-y-6 animate-pulse">
            <div className="h-10 w-1/3 bg-white rounded-lg mb-6" />

            {/* card - white with green accents */}
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
      }
    >
      <EqualCompanyPage />
    </Suspense>
  );
}