// app/api/view-pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ENCRYPTION_KEY = "c2e172f0b9b8acdf9d31b9ca8f989c2b"; // Must match your encryption

async function decryptBuffer(encryptedBuffer: ArrayBuffer): Promise<Uint8Array> {
  const encryptedData = new Uint8Array(encryptedBuffer);
  const iv = encryptedData.slice(0, 16);
  const data = encryptedData.slice(16);

  const keyBytes = new TextEncoder().encode(ENCRYPTION_KEY).slice(0, 32);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    cryptoKey,
    data
  );

  return new Uint8Array(decryptedBuffer);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const fileName = url.searchParams.get("file");
  if (!fileName) return NextResponse.json({ error: "No file specified" }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for server-side
  );

  const { data, error } = await supabase
    .storage
    .from("esop-uploads")
    .download(fileName);

  if (error || !data) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const encryptedBuffer = await data.arrayBuffer();
  const decrypted = await decryptBuffer(encryptedBuffer);

  return new NextResponse(decrypted, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName.replace('.enc', '.pdf')}"`,
    },
  });
}