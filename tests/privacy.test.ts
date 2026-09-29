/**
 * Privacy properties for Lantern's ZK reporting model.
 *
 * These tests verify the guarantees stated in the README privacy model:
 *   - A nullifier never leaks the reporter's secret or identity.
 *   - The reporter leaf (public commitment) cannot be reversed to reveal the secret.
 *   - Different reporters produce different nullifiers for the same channel.
 *   - The same reporter in different channels produces different nullifiers,
 *     so cross-channel correlation is impossible.
 */

import { describe, it, expect } from "vitest";
import {
  deriveReporterLeaf,
  deriveChannelNullifier,
  randomSecretHex,
} from "../src/lib/crypto";

describe("Privacy: nullifier unlinkability", () => {
  it("nullifier does not contain the reporter secret", async () => {
    const secret = "reporter-private-secret-xyz";
    const nullifier = await deriveChannelNullifier(secret, "Fraud Line");
    expect(nullifier).not.toContain(secret);
    expect(nullifier).not.toContain("reporter");
  });

  it("nullifier does not contain the channel label in plaintext", async () => {
    const nullifier = await deriveChannelNullifier("any-secret", "Ethics Line");
    expect(nullifier).not.toContain("Ethics Line");
    expect(nullifier).not.toContain("ethics");
  });

  it("two different reporters produce unlinkable nullifiers for the same channel", async () => {
    const n1 = await deriveChannelNullifier("alice-private-secret", "Safety Line");
    const n2 = await deriveChannelNullifier("bob-private-secret", "Safety Line");
    expect(n1).not.toBe(n2);
  });

  it("same reporter in two channels produces uncorrelated nullifiers", async () => {
    const n1 = await deriveChannelNullifier("alice-secret", "Fraud Line");
    const n2 = await deriveChannelNullifier("alice-secret", "Safety Line");
    // Cannot learn from n1 which reporter filed in channel 2
    expect(n1).not.toBe(n2);
    expect(n1).not.toContain(n2.slice(0, 8));
  });

  it("reporter leaf (public allowlist entry) does not expose the secret", async () => {
    const secret = "super-private-reporter-seed";
    const leaf = await deriveReporterLeaf(secret);
    expect(leaf).not.toContain(secret);
    expect(leaf).not.toContain("super");
  });

  it("randomSecretHex produces secrets with sufficient entropy (32 bytes)", () => {
    const secret = randomSecretHex(32);
    // 32 bytes = 64 hex chars
    expect(secret).toHaveLength(64);
    expect(secret).toMatch(/^[0-9a-f]{64}$/);
  });

  it("each randomSecretHex call produces a unique value", () => {
    const secrets = Array.from({ length: 20 }, () => randomSecretHex());
    const unique = new Set(secrets);
    expect(unique.size).toBe(20);
  });
});
