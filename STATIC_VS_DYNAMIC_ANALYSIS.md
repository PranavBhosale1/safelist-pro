# Static vs Dynamic Elements Analysis

## Overview
This document identifies which elements in the application are **static** (hardcoded/unchanging) vs **dynamic** (fetched from APIs), and what can be made dynamic using mock data to replace Tracxn API calls.

---

## 🔴 STATIC ELEMENTS (Currently Hardcoded)

### 1. **UI Components & Layout**
- ✅ **Static** - Navigation menus, buttons, cards, modals
- ✅ **Static** - Color schemes, themes, styling
- ✅ **Static** - Page layouts and structure
- ✅ **Static** - Form inputs and validation rules

### 2. **Suggested Companies List**
- 📍 **Location**: `components/CompanyInfographic.tsx` (lines 78-94)
- ✅ **Static** - List of 15 cybersecurity companies:
  ```typescript
  ['CrowdStrike', 'Palo Alto Networks', 'Fortinet', ...]
  ```
- 💡 **Can be made dynamic** - Move to database or config file

### 3. **Rate Limit Messages**
- ✅ **Static** - Error messages, rate limit warnings
- ✅ **Static** - UI text and labels

---

## 🟢 DYNAMIC ELEMENTS (Currently from Tracxn API)

### 1. **Company Search Results** (`/api/traxcn_card`)
**Used in**: `components/SearchCompany.tsx`, `components/CompanySearchInput.tsx`

**Data Structure**:
```typescript
type Company = {
  name: string;           // ✅ Dynamic
  location: string;       // ✅ Dynamic
  rating: string | number; // ✅ Dynamic
  url: string;            // ✅ Dynamic
  logo: string;          // ✅ Dynamic
}
```

**API Endpoint**: `GET /api/traxcn_card?name={companyName}`
**Can be mocked**: ✅ YES - Create mock company database

---

### 2. **Company Details** (`/api/traxcn_info`)
**Used in**: `components/company/equal_page.tsx`, `components/CompanyInfographic.tsx`

**Data Structure**:
```typescript
type CompanyDetails = {
  name?: string;
  websiteInfo?: { url?: string };
  foundedYear?: number | string;
  location?: { city?: string; state?: string; country?: string };
  latestValuation?: { amount?: { value?: number; currency?: string } };
  latestAnnualRevenue?: { amount?: { value?: number; currency?: string } };
  latestEmployeeCount?: { value?: number };
  companyRatings?: { editorRatingInfo?: { rating?: string | number } };
  totalMoneyRaised?: { totalAmount?: { amount?: number; currency?: string } };
  description?: { long?: string };
  // ... many more fields
}
```

**API Endpoint**: `GET /api/traxcn_info?CompanyName={domain}`
**Can be mocked**: ✅ YES - Create detailed mock company profiles

---

### 3. **Funding Rounds** (`/api/traxcn_info`)
**Used in**: `components/company/FundingTab.tsx`

**Data Structure**:
```typescript
type FundingRound = {
  fundingDate?: { day?: string; month?: string; year?: string };
  amount?: { amount?: number; currency?: string };
  postMoneyValuation?: { normalizedAmount?: { value?: number; currency?: string } };
  investorList?: Array<{ name?: string; domain?: string; isLead?: boolean }>;
}
```

**API Endpoint**: Part of `/api/traxcn_info`
**Can be mocked**: ✅ YES - Create mock funding history

---

### 4. **Investors** (`/api/traxcn_info`)
**Used in**: `components/company/InvestorTab.tsx`

**Data Structure**:
```typescript
type Investor = {
  name?: string;
  domain?: string;
  type?: string;
  id?: string;
  isLead?: boolean;
}
```

**API Endpoint**: Part of `/api/traxcn_info`
**Can be mocked**: ✅ YES - Create mock investor lists

---

### 5. **Company News/Insights**
**Used in**: `components/company/CompanyInsightsTab.tsx`

**Data Structure**:
```typescript
type NewsInfo = {
  totalArticles?: number;
  numberOfNewsArticlesLastYearDelta?: number;
  newsList?: Array<{
    headLine?: string;
    publicationDate?: string;
    sourceUrl?: string;
  }>;
}
```

**Can be mocked**: ✅ YES - Create mock news articles

---

## 📊 SUMMARY TABLE

| Element | Type | Source | Can Mock? | Priority |
|---------|------|--------|-----------|----------|
| Company Search Results | Dynamic | Tracxn API | ✅ YES | 🔴 HIGH |
| Company Details | Dynamic | Tracxn API | ✅ YES | 🔴 HIGH |
| Funding Rounds | Dynamic | Tracxn API | ✅ YES | 🟡 MEDIUM |
| Investors | Dynamic | Tracxn API | ✅ YES | 🟡 MEDIUM |
| News/Insights | Dynamic | Tracxn API | ✅ YES | 🟢 LOW |
| Suggested Companies | Static | Hardcoded | ✅ YES | 🟡 MEDIUM |
| UI Components | Static | Code | ❌ NO | - |
| Rate Limit Messages | Static | Code | ❌ NO | - |

---

## 🎯 RECOMMENDED MOCK DATA STRUCTURE

### 1. **Mock Company Database** (High Priority)
- 50-100 popular companies with basic info
- Include: name, domain, location, logo URL, rating
- Used for: Search results, company cards

### 2. **Mock Company Profiles** (High Priority)
- Detailed info for each company
- Include: valuation, revenue, employees, description
- Used for: Company detail pages

### 3. **Mock Funding History** (Medium Priority)
- 3-5 funding rounds per company
- Include: dates, amounts, investors
- Used for: Funding tab

### 4. **Mock Investor Lists** (Medium Priority)
- 5-10 investors per company
- Include: names, types, lead status
- Used for: Investor tab

### 5. **Mock News Articles** (Low Priority)
- 5-10 recent articles per company
- Include: headlines, dates, URLs
- Used for: Insights tab

---

## 🔧 IMPLEMENTATION STRATEGY

### Option 1: Environment-Based Mocking
- Add `USE_MOCK_DATA=true` in `.env`
- API routes check this flag and return mock data instead of calling Tracxn

### Option 2: Fallback Mocking
- Try Tracxn API first
- If it fails (rate limit, network error), fall back to mock data
- Best user experience

### Option 3: Complete Mock Replacement
- Remove all Tracxn API calls
- Use only mock data
- Simplest, but no real-time updates

**Recommended**: Option 2 (Fallback Mocking) - Best of both worlds

---

## 📝 NEXT STEPS

1. ✅ Create mock data files in `/lib/mockData/`
2. ✅ Update API routes to use mock data when Tracxn fails
3. ✅ Add environment variable to toggle mock mode
4. ✅ Test all components with mock data
5. ✅ Document mock data structure for future updates

