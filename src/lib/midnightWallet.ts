// midnightWallet.ts — real Midnight DApp Connector API integration.
// No fallback "demo wallet". Reference:
// https://docs.midnight.network/blog/connect-dapp-lace-wallet

export interface InjectedWallet {
  name: string;
  apiVersion: string;
  isEnabled: () => Promise<boolean>;
  enable?: () => Promise<WalletApi>;
  connect?: (networkId?: string) => Promise<WalletApi>;
}

export interface WalletApi {
  state: () => Promise<{ address: string }>;
  serviceUriConfig?: () => Promise<{ nodeUri: string; indexerUri: string; proverServerUri: string }>;
}

declare global {
  interface Window {
    midnight?: Record<string, InjectedWallet>;
  }
}

export type WalletStatus = "disconnected" | "connecting" | "connected" | "unavailable" | "error";

export function listInjectedWallets(): Array<{ id: string; wallet: InjectedWallet }> {
  if (!window.midnight) return [];
  return Object.entries(window.midnight).map(([id, wallet]) => ({ id, wallet }));
}

export async function connectWallet(walletId?: string): Promise<{
  address: string;
  walletName: string;
  api: WalletApi;
  serviceUriConfig?: { nodeUri: string; indexerUri: string; proverServerUri: string };
}> {
  const wallets = listInjectedWallets();
  if (wallets.length === 0) {
    throw new Error("No Midnight-compatible wallet was detected. Install Lace or 1AM Wallet, configured for Preprod, and reload.");
  }
  const target = walletId ? wallets.find((w) => w.id === walletId) : wallets[0];
  if (!target) throw new Error("The requested wallet is not installed.");

  const api = target.wallet.connect
    ? await target.wallet.connect('preprod')
    : await target.wallet.enable?.();
  
  if (!api) {
    throw new Error("Wallet connection failed.");
  }

  let address = "";
  try {
    if (typeof (api as any).getPublicKeys === 'function') {
      const keys = await (api as any).getPublicKeys();
      address = keys?.coinPublicKey ?? "";
    } else if ((api as any).coinPublicKey) {
      address = (api as any).coinPublicKey;
    } else if (typeof api.state === 'function') {
      const state = await api.state();
      address = state.address;
    }
  } catch (e) {
    console.warn("Failed to extract address:", e);
  }

  const serviceUriConfig = api.serviceUriConfig ? await api.serviceUriConfig() : undefined;
  return { address, walletName: target.wallet.name, api, serviceUriConfig };
}
