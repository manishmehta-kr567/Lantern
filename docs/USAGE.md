# Usage notes

## Circuit walkthrough (`contracts/lantern.compact`)

- `openChannel(label, root)` — organization opens the channel and
  publishes the Merkle root of every verified reporter's hashed secret.
- `submitReport(category)` — a reporter supplies three private
  witnesses (`reporterSecret`, `reporterPath`, `reportDetails`). The
  circuit proves membership, derives a channel-scoped nullifier,
  checks it hasn't been spent, then increments the public category
  counter, the report count, and (if detail was attached) the
  detailed-report count. Detail text itself never reaches the ledger.
- `closeChannel()` — freezes further reports.

## Going from stub to live calls (real on-chain transactions)

This repo ships with **no simulated ledger**. `src/lib/contractClient.ts`
throws until you complete this wiring.

1. Run `npm run compact:compile` to populate `managed/lantern`.
2. Build the eligibility Merkle tree off-chain from real members'
   hashed secrets, deploy with `openChannel` against that root, and
   record the Preprod contract address in `deployed_contract.json` and
   `README.md`.
3. In `src/lib/contractClient.ts`, replace `submitReport`'s body with a
   real call against `managed/lantern`, using
   `@midnight-ntwrk/midnight-js-contracts`. Mirror Midnight's official
   `example-counter` reference dApp: https://docs.midnight.network
   (see "Examples").
4. Once wired, surface the returned tx hash with an explorer link.

## Manual steps still required before submission

- [ ] Compile the contract and deploy to Preprod with a real eligibility root
- [ ] Wire `submitReport` to the generated bindings (step 3 above)
- [ ] Add the real Preprod contract address to `README.md` and `deployed_contract.json`
- [ ] Fill in every `[I WILL FILL THIS IN]` section of `PROPOSAL.md`
- [ ] Submit the chosen idea (Anonymous Feedback / Survey) for approval
- [ ] Record the 1-minute demo video showing a real transaction
- [ ] Make 10+ meaningful, incremental commits
- [ ] Deploy the frontend and add the live URL

## Demo video checklist
1. Full flow: connect a real wallet → generate a reporter secret →
   pick a category → file a report → show the transaction on a Preprod explorer
2. Terminal showing `npm test` output (12 passing)
3. README showing the green CI badge
