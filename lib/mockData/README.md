# Mock Data System

## Overview
This mock data system replaces Tracxn API calls when:
- Rate limits are exceeded
- Tracxn API is unavailable
- `USE_MOCK_DATA=true` is set in environment variables

## How It Works

### Automatic Fallback
The API routes automatically fall back to mock data when Tracxn API fails:
1. Try Tracxn API first
2. If it fails (rate limit, network error, etc.), use mock data
3. Return response with `X-Data-Source: mock-fallback` header

### Force Mock Mode
Set in `.env`:
```bash
USE_MOCK_DATA=true
```
This will skip Tracxn API entirely and use only mock data.

## Mock Data Structure

### Companies (`lib/mockData/companies.ts`)
- **50+ popular tech companies** with complete profiles
- Includes: name, domain, location, logo, ratings, valuation, revenue, employees
- Searchable by name or domain

### Funding Rounds
- Historical funding data for companies
- Includes: dates, amounts, valuations, investors

### Investors
- Investor lists for each company
- Includes: names, types, lead status

## Adding More Companies

To add more companies to the mock database:

1. Edit `lib/mockData/companies.ts`
2. Add to `MOCK_COMPANIES` array:
```typescript
{
  name: "Company Name",
  domain: "company.com",
  location: { city: "City", state: "State", country: "Country" },
  logo: "https://logo.clearbit.com/company.com",
  rating: 4,
  url: "https://www.company.com",
  foundedYear: 2020,
  // ... other fields
}
```

3. Optionally add funding rounds and investors:
```typescript
MOCK_FUNDING_ROUNDS["company.com"] = [
  {
    fundingDate: { day: "15", month: "06", year: "2023" },
    amount: { amount: 10000000, currency: "USD" },
    // ...
  }
];
```

## API Response Headers

The API routes include a header indicating data source:
- `X-Data-Source: tracxn` - Data from Tracxn API
- `X-Data-Source: mock` - Data from mock (forced mode)
- `X-Data-Source: mock-fallback` - Data from mock (fallback after Tracxn failed)

## Testing

To test with mock data only:
1. Set `USE_MOCK_DATA=true` in `.env`
2. Restart the dev server
3. All API calls will use mock data

## Current Mock Companies

- CrowdStrike
- Palo Alto Networks
- Fortinet
- Check Point
- Zscaler
- Okta
- Rapid7
- SentinelOne
- Qualys
- Tenable
- Splunk
- Darktrace
- Varonis
- Proofpoint
- Cisco
- ... and more

