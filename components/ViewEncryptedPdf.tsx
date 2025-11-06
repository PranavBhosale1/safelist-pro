// components/ViewEncryptedPdf.tsx
"use client";

import React from "react";

const ENCRYPTION_KEY = "c2e172f0b9b8acdf9d31b9ca8f989c2b"; // Must match encryption

async function decryptEncryptedPDF(url: string): Promise<Blob> {
  const res = await fetch(url);
  const encryptedBuffer = await res.arrayBuffer();

  const encryptedData = new Uint8Array(encryptedBuffer);
  const iv = encryptedData.slice(0, 16);
  const data = encryptedData.slice(16);

  const keyBytes = new TextEncoder().encode(ENCRYPTION_KEY).slice(0, 32);

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    cryptoKey,
    data
  );

  return new Blob([decryptedBuffer], { type: "application/pdf" });
}

export default function ViewEncryptedPdf({ fileUrl }: { fileUrl: string }) {
  const handleView = async () => {
    try {
      const decryptedBlob = await decryptEncryptedPDF(fileUrl);
      const url = URL.createObjectURL(decryptedBlob);
      window.open(url, "_blank");
    } catch (err) {
      alert("Failed to decrypt PDF. Check key or file.");
      console.error(err);
    }
  };

  return (
    <button
      onClick={handleView}
      className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold shadow-md border-2 border-green-700 transition-all hover:shadow-lg hover:bg-green-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500"
    >
      View Document
    </button>
  );
}
