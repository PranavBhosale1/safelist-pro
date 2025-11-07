# API Rate Usage Analysis

## Overview
Your application uses the Tracxn API through three main endpoints, each with different consumption patterns. All endpoints use the **'standard'** API type which has limits of:
- **100 requests per hour**
- **1000 requests per day**

## API Endpoints & External API Calls

### 1. `/api/traxcn_card` ⚠️ **HIGHEST CONSUMPTION**
- **External API calls per request: 2**
  - 1 call to `/companies/search` (search by name)
  - 1 call to `/companies` (fetch details for up to 10 domains)
- **Usage locations:**
  - ✅ `components/CompanyInfographic.tsx` - **NOW DISABLED** (was highest consumer)
    - Previously: Verified 15 suggested companies on dialog open
    - Previously: Fetched each tracked company
    - Previously: Search functionality
  - ⚠️ `components/SearchCompany.tsx` - **ACTIVE HIGH CONSUMPTION**
    - Debounced search (500ms) - triggers on every keystroke
    - Used in dashboard navigation
    - **Each search = 2 external API calls**
  - ⚠️ `components/CompanySearchInput.tsx` - **ACTIVE HIGH CONSUMPTION**
    - Debounced search (300ms) - triggers on every keystroke
    - Used in sell script forms
    - **Each search = 2 external API calls**

### 2. `/api/traxcn_info` ⚠️ **HIGHEST PER-REQUEST CONSUMPTION**
- **External API calls per request: 3**
  - 1 call to `/companies` (company details)
  - 1 call to `/transactions` (funding rounds)
  - 1 call to `/investors` (investor list)
- **Usage locations:**
  - ✅ `components/CompanyInfographic.tsx` - **NOW DISABLED**
    - Previously: Called for each tracked company to get detailed info
    - **Each call = 3 external API calls**
  - `components/company/equal_page.tsx` - Active
    - Called once when viewing company details page
    - **Each view = 3 external API calls**

### 3. `/api/traxcn` ✅ **MODERATE CONSUMPTION**
- **External API calls per request: 4**
  - 1 call to `/companies/search` (search by name)
  - 3 calls from `fetchCompanyInfo` (companies, transactions, investors)
- **Usage locations:**
  - `components/company/equal_page.tsx` - Active
    - Called once when loading company page
    - **Each view = 4 external API calls**

## Current Highest Consumers (After Disabling CompanyInfographic)

### 🥇 **SearchCompany Component** 
- **Location:** `components/SearchCompany.tsx`
- **Impact:** High
- **Reason:** 
  - Debounced search triggers on every keystroke after 500ms
  - Each search = 2 external API calls
  - Users typing quickly can trigger multiple searches
  - **Example:** Typing "Microsoft" (9 characters) with delays = ~3-5 API calls = 6-10 external calls

### 🥈 **CompanySearchInput Component**
- **Location:** `components/CompanySearchInput.tsx`
- **Impact:** High
- **Reason:**
  - Debounced search triggers on every keystroke after 300ms
  - Each search = 2 external API calls
  - Used in sell script forms where users search for companies
  - **Example:** Typing "Apple" (5 characters) = ~2-3 API calls = 4-6 external calls

### 🥉 **Company Details Page (equal_page.tsx)**
- **Location:** `components/company/equal_page.tsx`
- **Impact:** Medium
- **Reason:**
  - Makes 4 external API calls per page load
  - Only called once per page view (not on every keystroke)
  - **Each page view = 4 external API calls**

## Recommendations to Reduce API Usage

### 1. **Implement Caching** (Highest Priority)
   - Cache search results in localStorage or sessionStorage
   - Cache company details for a period (e.g., 1 hour)
   - Reduces redundant API calls

### 2. **Increase Debounce Times**
   - Increase `SearchCompany` debounce from 500ms to 800-1000ms
   - Increase `CompanySearchInput` debounce from 300ms to 600ms
   - Reduces API calls during fast typing

### 3. **Require Minimum Query Length**
   - Only search after 3-4 characters instead of 2
   - Reduces unnecessary searches for incomplete queries

### 4. **Batch Search Requests**
   - Wait for user to stop typing before searching
   - Cancel previous requests when new ones are made

### 5. **Add Search Result Pagination**
   - Limit initial results and load more on demand
   - Reduces data fetched per request

### 6. **Use Local Search for Common Companies**
   - Pre-populate common companies locally
   - Only hit API for rare/uncommon companies

## Rate Limit Tracking

The application tracks API usage in the `api_rate_limits` table with:
- `user_id` - User who made the request
- `api_type` - Type of API ('standard' or 'key_metrics')
- `created_at` - Timestamp of the API call

You can query this table to see actual usage patterns:
```sql
-- Get API usage by endpoint (approximate)
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as api_calls,
  COUNT(DISTINCT user_id) as unique_users
FROM api_rate_limits
WHERE api_type = 'standard'
GROUP BY hour
ORDER BY hour DESC;
```

## Summary

**Before disabling CompanyInfographic:**
- CompanyInfographic was the highest consumer (multiple companies × 2-3 calls each)

**After disabling CompanyInfographic:**
- **SearchCompany** and **CompanySearchInput** are now the highest consumers
- Both trigger searches on every keystroke with short debounce times
- **Recommendation:** Focus optimization efforts on these two components first

