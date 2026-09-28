// crypto.ts — pure helpers mirroring contracts/lantern.compact's hashing.

export async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function randomSecretHex(bytes = 16): string {
  const arr = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Matches `persistentHash<Bytes<32>>(secret)`. */
export function deriveReporterLeaf(secret: string): Promise<string> {
  return sha256Hex(secret);
}

/** Matches the circuit's `[secret, hash(channelLabel)]`. */
export async function deriveChannelNullifier(secret: string, channelLabel: string): Promise<string> {
  const labelHash = await sha256Hex(channelLabel);
  return sha256Hex(`${secret}:${labelHash}`);
}

export function isValidCategory(category: number): boolean {
  return Number.isInteger(category) && category >= 1 && category <= 5;
}
