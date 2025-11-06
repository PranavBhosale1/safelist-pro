import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import { NextResponse } from 'next/server';
import { generateResponseFromTranscript } from '@/lib/gemini';

const execAsync = promisify(exec);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyName = searchParams.get('name');

  if (!companyName) {
  return NextResponse.json({ error: 'Missing company name' }, { status: 400 });
}

const scriptPath = path.resolve('./python/fox_scraper.py');
const command = `python "${scriptPath}" "${companyName}"`;

try {
  const { stdout } = await execAsync(command);
  const data = JSON.parse(stdout);

  // If data is empty, call fallback API and merge
  if (Object.keys(data).length === 0) {

    const fallbackResponse = await fetch('/api/crunchbase', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ domain: companyName })
});
    const fallbackData = await fallbackResponse.json();

    // Merge fallbackData into data
    Object.assign(data, fallbackData);
  }

  const rawText = JSON.stringify(data, null, 2);
  const geminiResponse = await generateResponseFromTranscript(rawText);

  return NextResponse.json({ source: 'combined', geminiResponse });

} catch (error) {
  console.error('Error running script or parsing output:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
}
