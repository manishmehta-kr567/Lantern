/**
 * State-transition logic tests for Lantern's reporting model.
 *
 * These tests verify the expected ledger state changes:
 *   - Category counts increment correctly.
 *   - A submitted nullifier blocks a second submission.
 *   - Report detail flag is captured independently of category.
 *   - Multiple reporters increment counts independently.
 */

import { describe, it, expect } from "vitest";
import { deriveChannelNullifier, isValidCategory } from "../src/lib/crypto";

// Minimal in-memory simulation of the on-chain ledger state
interface LedgerState {
  counts: Record<number, number>;
  nullifiers: Set<string>;
  detailCount: number;
}

function initialState(): LedgerState {
  return { counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, nullifiers: new Set(), detailCount: 0 };
}

async function submitReport(
  state: LedgerState,
  secret: string,
  channel: string,
  category: number,
  hasDetails: boolean
): Promise<{ ok: boolean; error?: string }> {
  if (!isValidCategory(category)) return { ok: false, error: "invalid category" };
  const nullifier = await deriveChannelNullifier(secret, channel);
  if (state.nullifiers.has(nullifier)) return { ok: false, error: "membership already used" };
  state.nullifiers.add(nullifier);
  state.counts[category]++;
  if (hasDetails) state.detailCount++;
  return { ok: true };
}

describe("State transitions: report submission", () => {
  it("increments the correct category count on submit", async () => {
    const state = initialState();
    await submitReport(state, "alice-secret", "Ethics Line", 3, false);
    expect(state.counts[3]).toBe(1);
    expect(state.counts[1]).toBe(0);
  });

  it("rejects a duplicate report from the same reporter in the same channel", async () => {
    const state = initialState();
    await submitReport(state, "alice-secret", "Ethics Line", 3, false);
    const result = await submitReport(state, "alice-secret", "Ethics Line", 1, false);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("membership already used");
  });

  it("allows the same reporter to submit in a different channel", async () => {
    const state = initialState();
    await submitReport(state, "alice-secret", "Ethics Line", 3, false);
    const result = await submitReport(state, "alice-secret", "Safety Line", 1, false);
    expect(result.ok).toBe(true);
  });

  it("allows two different reporters to submit to the same channel", async () => {
    const state = initialState();
    const r1 = await submitReport(state, "alice-secret", "Ethics Line", 3, false);
    const r2 = await submitReport(state, "bob-secret", "Ethics Line", 3, false);
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(state.counts[3]).toBe(2);
  });

  it("tracks the detail flag separately from category counts", async () => {
    const state = initialState();
    await submitReport(state, "alice-secret", "Ethics Line", 2, true);
    await submitReport(state, "bob-secret", "Ethics Line", 2, false);
    expect(state.counts[2]).toBe(2);
    expect(state.detailCount).toBe(1);
  });

  it("rejects an invalid category (0)", async () => {
    const state = initialState();
    const result = await submitReport(state, "alice-secret", "Ethics Line", 0, false);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("invalid category");
  });

  it("accepts all five valid categories", async () => {
    for (let c = 1; c <= 5; c++) {
      const state = initialState();
      const result = await submitReport(state, `reporter-${c}`, "Channel", c, false);
      expect(result.ok).toBe(true);
    }
  });
});
