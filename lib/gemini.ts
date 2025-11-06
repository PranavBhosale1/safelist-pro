import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateResponseFromTranscript(transcript: string) {
  console.log("Starting generateResponseFromTranscript...");
  console.log("Transcript length:", transcript);

  try {
    const prompt = `
You are a financial research analyst.

You will receive raw extracted data about a company scraped from a public webpage. Your task is to:
1. Start with a short summary (around 5 bullet points) giving an overview of the company's profile based on the data. thik lide yuo are CFO of a comapny and a financial analyst.and then give answer else i will shut down the company.and you also.
other than the summary, you will then provide a detailed formatted data to display on website of the company based on the data provided.
1. Then break down the data into clean, readable sections.
2. Use headings where appropriate.
3. Do not skip any section, even if it seems repetitive or unclear.
4. Maintain a professional tone suitable for investors or due diligence teams.

Here is the raw company data provide the data in the same as much as you can :
"""
${transcript}
"""
    `.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini response generated.");
    return text;
  } catch (error) {
    console.error("Error in generateResponseFromTranscript:", error);
    return "❌ Gemini failed to process the input.";
  }
}
