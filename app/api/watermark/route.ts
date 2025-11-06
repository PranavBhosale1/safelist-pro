// app/api/watermark/route.ts
import { PDFDocument, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import { degrees } from "pdf-lib";
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const watermark = formData.get("watermark")?.toString() || "Confidential";

  if (!file || file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { height } = page.getSize();

   page.drawText(watermark, {
  x: 0,
  y: height*1.4,
  size: 40,
  color: rgb(1, 0, 0),
  rotate: degrees(-56.5),
  opacity: 0.3,
});

page.drawText(watermark, {
  x: 0,
  y: height*0.9,
  size: 40,
  color: rgb(1, 0, 0),
  rotate: degrees(-56.5),
  opacity: 0.3,
});

page.drawText(watermark, {
  x: 0,
  y: height * 0.4,
  size: 40,
  color: rgb(1, 0, 0),
  rotate: degrees(-56.5),
  opacity: 0.3,
});
  }

  const watermarkedBytes = await pdfDoc.save();

  return new NextResponse(watermarkedBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=watermarked.pdf`,
    },
  });
}
