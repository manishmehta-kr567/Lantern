import { describe, it, expect } from "vitest";
import { deriveReporterLeaf, deriveChannelNullifier, isValidCategory, randomSecretHex } from "../src/lib/crypto";

describe("deriveReporterLeaf", () => {
  it("is deterministic for the same secret", async () => {
    const a = await deriveReporterLeaf("reporter-a-secret");
    const b = await deriveReporterLeaf("reporter-a-secret");
    expect(a).toBe(b);
  });

  it("produces a 64-character hex digest", async () => {
    expect(await deriveReporterLeaf("reporter-a-secret")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("differs for different secrets", async () => {
    const a = await deriveReporterLeaf("reporter-a-secret");
    const b = await deriveReporterLeaf("reporter-b-secret");
    expect(a).not.toBe(b);
  });
});

describe("deriveChannelNullifier", () => {
  it("is deterministic for the same secret and channel", async () => {
    const a = await deriveChannelNullifier("reporter-a-secret", "Ethics Line");
    const b = await deriveChannelNullifier("reporter-a-secret", "Ethics Line");
    expect(a).toBe(b);
  });

  it("differs between channels for the same reporter (nullifier is channel-scoped)", async () => {
    const a = await deriveChannelNullifier("reporter-a-secret", "Ethics Line");
    const b = await deriveChannelNullifier("reporter-a-secret", "Safety Line");
    expect(a).not.toBe(b);
  });

  it("differs between reporters for the same channel", async () => {
    const a = await deriveChannelNullifier("reporter-a-secret", "Ethics Line");
    const b = await deriveChannelNullifier("reporter-b-secret", "Ethics Line");
    expect(a).not.toBe(b);
  });

  it("never contains the raw secret as a substring", async () => {
    const n = await deriveChannelNullifier("reporter-a-secret", "Ethics Line");
    expect(n).not.toContain("reporter-a-secret");
  });
});

describe("isValidCategory", () => {
  it("accepts integers 1 through 5", () => {
    for (let c = 1; c <= 5; c++) expect(isValidCategory(c)).toBe(true);
  });

  it("rejects 0 and 6", () => {
    expect(isValidCategory(0)).toBe(false);
    expect(isValidCategory(6)).toBe(false);
  });

  it("rejects non-integer input", () => {
    expect(isValidCategory(2.5)).toBe(false);
  });
});

describe("randomSecretHex", () => {
  it("produces distinct secrets across calls", () => {
    expect(randomSecretHex()).not.toBe(randomSecretHex());
  });

  it("produces a hex string of the expected length", () => {
    expect(randomSecretHex(16)).toMatch(/^[0-9a-f]{32}$/);
  });
});
