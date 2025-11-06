import sys
import json
from camoufox.sync_api import Camoufox

def scrape_from_google(query):
    google_url = f"https://www.google.com/search?q={query.replace(' ', '+')}"

    try:
        with Camoufox(humanize=True, headless=False, geoip=True, locale="en-US") as browser:
            page = browser.new_page()
            page.goto(google_url)
            page.wait_for_load_state("domcontentloaded")

            result = page.locator("a h3").first
            result.click()
            page.wait_for_load_state("load")
            page.wait_for_timeout(3000)

            title = page.locator("h1").first.inner_text()

            # Extract all tables
            all_tables = []
            tables = page.locator("table")
            for i in range(tables.count()):
                rows = tables.nth(i).locator("tr").all_inner_texts()
                all_tables.append(rows)

            # Extract all <p> content
            paragraphs = page.locator("p").all_inner_texts()

            return {
                "title": title,
                "tables": all_tables,
                "paragraphs": paragraphs
            }

    except Exception as e:
        # Log error if needed: print(f"Error: {e}")
        return {}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Please provide the company name"}))
        sys.exit(1)

    company = sys.argv[1]

    query1 = f"{company} buy site:wwipl.com"
    query2 = f"{company} balance sheet site:wwipl.com"

    result1 = scrape_from_google(query1)
    result2 = scrape_from_google(query2)

    combined = {
        "result_1": result1,
        "result_2": result2
    }

    print(json.dumps(combined))
