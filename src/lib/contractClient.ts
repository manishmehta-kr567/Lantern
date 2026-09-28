// contractClient.ts — the single place the UI submits a transaction.
// Not a local ledger simulator. See docs/USAGE.md "Going from stub to
// live calls" for wiring this to a real deployed contract.

import deployedContract from "../../deployed_contract.json";
import { WalletApi } from "./midnightWallet";

export interface DeploymentInfo {
  network: string;
  address: string | null;
}

export function getDeployment(): DeploymentInfo {
  return { network: deployedContract.network, address: deployedContract.address };
}

export function isDeployed(): boolean {
  return Boolean(deployedContract.address);
}

export interface SubmitReportParams {
  wallet: WalletApi;
  reporterSecret: string;
  category: number;
  hasDetails: boolean;
}

export interface TxResult {
  txHash: string;
  explorerUrl: string;
}

export async function submitReport(params: SubmitReportParams): Promise<TxResult> {
  if (!isDeployed()) {
    throw new Error("No contract is deployed yet. Run `compact compile`, deploy to Preprod, and fill in deployed_contract.json.");
  }
  
  const { submitReportOnChain } = await import('./onchain');
  const result = await submitReportOnChain(params.reporterSecret, params.category, params.hasDetails);
  
  if (result.ok) {
    return {
      txHash: result.txId,
      explorerUrl: result.explorerUrl
    };
  } else {
    throw new Error(result.error);
  }
}
