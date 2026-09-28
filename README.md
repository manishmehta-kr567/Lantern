# Lantern
![CI](https://github.com/YOUR_USERNAME/lantern/actions/workflows/ci.yml/badge.svg)
> Anonymous incident reporting with verifiable participation. Built on Midnight.

## Live Demo
[LIVE URL — add after deploying, e.g. Vercel/Netlify]

## Contract Address
| Network  | Address                          |
|----------|-----------------------------------|
| Preprod  | `[CONTRACT ADDRESS — REQUIRED]`    |

## What This Does
Lantern gives an organization a reporting channel where every report is
provably from a verified member, yet cannot be traced to any individual.
An organization publishes the Merkle root of its eligible reporters;
members file a report by proving membership and choosing an incident
category (Safety, Harassment, Fraud, Ethics, Other). Only the aggregate
category counts are public. The text of a report never touches the
chain in any form — not even as a hash.

## No mock data — architecture note
This build has **no local ledger simulator**. `src/lib/contractClient.ts`
refuses to fabricate a transaction result: every action either goes
through a connected wallet against a real deployed contract, or the UI
tells you plainly that nothing is deployed yet. See docs/USAGE.md for
the exact steps to wire it up to a live Preprod deployment.

## Privacy Model
- **PUBLIC:** the channel's label, per-category report counts, how many
  reports included written detail, the set of spent nullifiers,
  open/closed status.
- **PRIVATE:** who filed any report, the full text of every report,
  and any link between a nullifier and a reporter.
- **PROVED without revealing:** that the caller is a verified member
  who has not already filed through this channel — without revealing
  who they are or what they reported.

## Privacy Claim
An on-chain observer can see how many reports exist in each category
and confirm no member filed twice (the nullifier set only grows). What
they cannot see, at any point, is who filed which report, or anything
about report content. Known simplification: one report per reporter per
channel; a production deployment would likely allow several, e.g. by
adding a report-index to the nullifier as Enclave does for rooms.

## Tech Stack
- **Contract:** Compact (`contracts/lantern.compact`)
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Wallet:** Midnight DApp Connector API (multi-wallet detection)
- **Tests:** Vitest, covering the pure witness-derivation helpers
- **CI/CD:** GitHub Actions

## Prerequisites
- Node.js v22+, npm
- [Midnight `compact` CLI](https://docs.midnight.network)
- A Midnight-compatible wallet (Lace or 1AM), funded on Preprod

## Setup & Run Locally
```bash
npm install
npm run compact:compile   # requires the Midnight toolchain
npm run dev
```
Until `deployed_contract.json` has a real address and
`src/lib/contractClient.ts`'s live-call section is wired to your
compiled `managed/lantern` bindings (see docs/USAGE.md), the app runs
but honestly reports that no contract is deployed rather than
simulating one.

## Run Tests
```
npm test
```

## CI/CD
On every push and pull request to `main`, the GitHub Actions pipeline
checks out the code, installs dependencies on Node 22, compiles the
Compact contract when the toolchain is present, lints, runs the full
Vitest suite, and produces a production build.

## Product Proposal
See [PROPOSAL.md](./PROPOSAL.md).
