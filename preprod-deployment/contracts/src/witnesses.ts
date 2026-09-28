// Lantern — witness implementations for the anonymous incident reporting contract.
// These functions supply private state to the ZK circuits without revealing it on-chain.

import { Ledger } from "./managed/bboard/contract/index.js";
import { WitnessContext } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";

// Private state: just the reporter's secret key.
export type LanternPrivateState = {
  readonly secretKey: Uint8Array;
};

export const createLanternPrivateState = (secretKey: Uint8Array): LanternPrivateState => ({
  secretKey,
});

// The witnesses object must have exactly one function per `witness` declaration
// in lantern.compact:
//   witness reporterSecretKey(): Bytes<32>
//   witness reportHasDetail():   Boolean
//
// During deployment only the constructor runs — no witnesses are called —
// but the Contract class constructor requires all witness functions to be
// present, so we supply them here. The dummy values for reportHasDetail are
// fine for deployment; real reporters will override them at call time.
export const witnesses = {
  reporterSecretKey: ({
    privateState,
  }: WitnessContext<Ledger, LanternPrivateState>): [LanternPrivateState, Uint8Array] =>
    [privateState, privateState.secretKey],

  reportHasDetail: ({
    privateState,
  }: WitnessContext<Ledger, LanternPrivateState>): [LanternPrivateState, boolean] =>
    [privateState, false],
};
