# Product Proposal

## What is the product, and who uses it?
Lantern is an anonymous, verifiable incident reporting platform designed for organizations (corporations, DAOs, or universities) that need to maintain strict compliance and ethics lines. It allows verified members (e.g., employees, contributors) to submit reports on critical issues such as Fraud, Harassment, or Safety violations. Because reporters are often afraid of retaliation, Lantern guarantees absolute anonymity. However, to prevent spam and false claims from external actors, the organization can mathematically verify that every submitted report came from a legitimate, pre-authorized member of the organization without ever knowing *which* member it was.

## Why Midnight specifically?
Midnight is uniquely positioned for this product because it provides programmable data protection (ZK-SNARKs) out-of-the-box. If this were built on a transparent chain (like Ethereum or Cardano), any report submitted by an employee would instantly leak their wallet address or on-chain identity, defeating the purpose of an anonymous ethics line and exposing them to retaliation. Conversely, if it were built as a traditional Web2 app, users would have to blindly trust the organization's IT department not to log their IP addresses or database submissions. 

Midnight solves this by allowing the user's local device to generate a zero-knowledge proof that says: "I am in the list of eligible employees, and I have not submitted a report yet," while keeping their actual identity entirely as a private witness. The public ledger only records that a valid report occurred and increments the category counter.

## Data Model
| Data Point                                 | Type           | Disclosed To |
|--------------------------------------------|----------------|--------------|
| Total incident counts per category         | Public ledger  | Everyone     |
| Total number of reports with details       | Public ledger  | Everyone     |
| Organization's eligible member Merkle Root | Public ledger  | Everyone     |
| The reporter's identity / Secret Key       | Private witness| No one       |
| The specific report content / text         | Private witness| No one (stays on local device) |
| The nullifier (preventing double-reports)  | Public ledger  | Everyone (but unlinkable to the reporter) |

## Mainnet Feasibility
Yes, this is highly realistic to reach Mainnet by Level 6. The core cryptographic primitive—verifying inclusion in a Merkle tree and emitting a nullifier to prevent double-spending/reporting—is a well-understood and lightweight ZK pattern that perfectly fits Midnight's Compact language. The frontend is already integrated with the Midnight wallet and capable of generating proofs. Future levels will focus on polishing the onboarding flow (how an organization generates and distributes the initial secrets to employees) and potentially adding a feature to encrypt the actual text of the report so that only a designated auditor (e.g., HR) can decrypt and read it.
