import puppeteer from 'puppeteer';

export async function scrapeCompanyPage(companyName: string): Promise<string> {
  const browser = await puppeteer.launch({
    headless: true, // modern headless mode
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' });

    await page.type('input[name="q"]', `${companyName} financial wwipl`);
    await page.keyboard.press('Enter');

    await page.waitForSelector('h3', { timeout: 10000 });

    const firstResult = await page.$('h3');
    const link = await firstResult?.evaluate((node) => {
      const anchor = node.closest('a');
      return anchor ? (anchor as HTMLAnchorElement).href : null;
    });

    if (!link) throw new Error('No result link found');

    await page.goto(link, { waitUntil: 'domcontentloaded' });

    const html = await page.content();
    return html;
  } finally {
    await browser.close();
  }
}
