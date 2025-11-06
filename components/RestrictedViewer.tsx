"use client";


import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";




 // Must match encryption
/*
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
}*/

export default function IframePdfViewer({ docUrl }: { docUrl: string }) {
  return (
    <>
      <div className="relative w-full h-[60vh] md:h-[80vh]">
        <iframe
          src={`/api/view-pdf?file=${encodeURIComponent(docUrl)}`}
          className="w-full h-full rounded-md"
          frameBorder="0"
          title="PDF Viewer"
          allowFullScreen
          scrolling="auto"
          onContextMenu={e => e.preventDefault()}
          onDragStart={e => e.preventDefault()}
        />
        {/* Overlay to block right-click, drag, etc. (only top bar) */}
        <div
          className="absolute top-0 left-0 right-0 h-10 z-10 pointer-events-auto"
          onContextMenu={e => e.preventDefault()}
          onDragStart={e => e.preventDefault()}
        />
      </div>
    </>
  );
}
