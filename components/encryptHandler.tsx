export async function encryptBufferBrowser(plainData: Uint8Array, keyString: string): Promise<Uint8Array> {
  const iv = window.crypto.getRandomValues(new Uint8Array(16));
  const keyBytes = new TextEncoder().encode(keyString).slice(0, 32); // 256-bit key

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-CBC" },
    false,
    ["encrypt"]
  );

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    cryptoKey,
    plainData
  );

  return new Uint8Array([...iv, ...new Uint8Array(encrypted)]); // prepend IV
}
