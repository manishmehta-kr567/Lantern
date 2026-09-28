// Lantern — witness implementations for the anonymous incident reporting contract.
// These functions supply private state to the ZK circuits without revealing it on-chain.

import { Ledger } from "./managed/bboard/contract/index.js";
import { WitnessContext } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";

export type LanternPrivateState = {
  readonly secretKey: Uint8Array;
  readonly merklePath: Uint8Array[];
  readonly pathDirections: boolean[];
};

export const createLanternPrivateState = (secretKey: Uint8Array, merklePath: Uint8Array[], pathDirections: boolean[]): LanternPrivateState => ({
  secretKey,
  merklePath,
  pathDirections
});

export const witnesses = {
  secretKey: ({
    privateState,
  }: WitnessContext<Ledger, LanternPrivateState>): [LanternPrivateState, Uint8Array] =>
    [privateState, privateState.secretKey],

  merklePath: ({
    privateState,
  }: WitnessContext<Ledger, LanternPrivateState>): [LanternPrivateState, Uint8Array[]] =>
    [privateState, privateState.merklePath],

  pathDirections: ({
    privateState,
  }: WitnessContext<Ledger, LanternPrivateState>): [LanternPrivateState, boolean[]] =>
    [privateState, privateState.pathDirections],
};
