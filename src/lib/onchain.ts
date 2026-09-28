import { midnightWallet } from './midnightWallet';
import { getDeployment } from './contractClient';

// Helper to convert a hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export type OnChainResult =
  | { ok: true; txId: string; explorerUrl: string }
  | { ok: false; error: string };

export async function submitReportOnChain(
  reporterSecretHex: string,
  _category: number, // we only call checkAccess on gatecheck now
  _hasDetails: boolean
): Promise<OnChainResult> {
  try {
    const [
      { indexerPublicDataProvider },
      { httpClientProofProvider },
      { FetchZkConfigProvider },
      { findDeployedContract },
      { CompiledBBoardContractContract },
      { setNetworkId },
      { Transaction },
      { toHex, fromHex }
    ] = await Promise.all([
      import('@midnight-ntwrk/midnight-js-indexer-public-data-provider'),
      import('@midnight-ntwrk/midnight-js-http-client-proof-provider'),
      import('@midnight-ntwrk/midnight-js-fetch-zk-config-provider'),
      import('@midnight-ntwrk/midnight-js-contracts'),
      import('@midnight-ntwrk/bboard-contract'),
      import('@midnight-ntwrk/midnight-js-network-id'),
      import('@midnight-ntwrk/midnight-js-protocol/ledger'),
      import('@midnight-ntwrk/midnight-js-utils')
    ]);

    // Patch global context for browser bundle
    const _g = globalThis as Record<string, unknown>;
    if (!_g['currentQueryContext']) {
      _g['currentQueryContext'] = () => ({ queryContext: null, witnessContext: null, ledgerContext: null });
    }
    if (!_g['copyCircuitContext']) _g['copyCircuitContext'] = (ctx: unknown) => ctx;
    if (!_g['finalizeCallProofData']) _g['finalizeCallProofData'] = () => null;

    setNetworkId('preprod');

    const deployment = getDeployment();
    if (!deployment.address) throw new Error("Contract not deployed");
    const CONTRACT_ADDRESS = deployment.address;
    
    // We can assume preprod network endpoints
    const indexerHttp = 'https://indexer.preprod.midnight.network/api/v4/graphql';
    const indexerWs = indexerHttp.replace('https', 'wss').replace('http', 'ws');
    
    // Config path where managed files are served from public directory
    const zkConfigPath = `${window.location.origin}/managed/bboard`;
    const ONEAM_PROOF_SERVER = 'https://api-preprod.1am.xyz';

    // Ensure we are connected
    const { address, api } = await import('./midnightWallet').then(m => m.connectWallet());
    const ap = api as Record<string, any>;
    
    let coinPublicKey = address;
    let encryptionPublicKey = null;
    
    if (typeof ap.getShieldedAddresses === 'function') {
      try {
        const shield = await ap.getShieldedAddresses();
        if (shield && Array.isArray(shield) && shield.length > 0) {
          const item = shield[0];
          encryptionPublicKey = typeof item !== 'string' ? (item.shieldedEncryptionPublicKey || item.encryptionPublicKey || null) : null;
        } else if (shield) {
          encryptionPublicKey = typeof shield !== 'string' ? (shield.shieldedEncryptionPublicKey || shield.encryptionPublicKey || null) : null;
        }
      } catch (e: unknown) { 
        console.error('getShieldedAddresses failed', e); 
      }
    }
    
    if (!coinPublicKey) throw new Error('Could not retrieve wallet coin public key.');

    const zkConfigProvider = new FetchZkConfigProvider(zkConfigPath, fetch.bind(window));
    const proofProvider = httpClientProofProvider(ONEAM_PROOF_SERVER, zkConfigProvider);

    const walletProvider = {
      getCoinPublicKey: () => coinPublicKey,
      getEncryptionPublicKey: () => (encryptionPublicKey || coinPublicKey),
      balanceTx: async (tx: any) => {
        const serializedTx = toHex(tx.serialize());
        if (typeof ap?.balanceUnsealedTransaction === 'function') {
          const received = await ap.balanceUnsealedTransaction(serializedTx);
          return Transaction.deserialize('signature', 'proof', 'binding', fromHex(received.tx));
        }
        throw new Error('balanceUnsealedTransaction missing');
      }
    };

    const midnightProvider = {
      submitTx: async (tx: any) => {
        const txHex = toHex(tx.serialize());
        if (typeof ap?.submitTransaction === 'function') {
          const res = await ap.submitTransaction(txHex);
          let returnedId = typeof res === 'string' ? res : (res?.txHash || res?.id || '');
          return returnedId.replace(/^0x/, '');
        }
        throw new Error('Connected wallet does not support submitTransaction.');
      }
    };

    const privateStateId = 'lantern-reporter';
    const { levelPrivateStateProvider } = await import('@midnight-ntwrk/midnight-js-level-private-state-provider');
    const privateStateProvider = levelPrivateStateProvider({
      privateStateStoreName: `lantern-private-state`,
      signingKeyStoreName: `lantern-signing-`,
      privateStoragePasswordProvider: () => "TempPassword123!Secure",
      accountId: coinPublicKey,
    });

    const providers = {
      privateStateProvider,
      publicDataProvider: indexerPublicDataProvider(indexerHttp, indexerWs),
      zkConfigProvider,
      proofProvider,
      walletProvider,
      midnightProvider,
    };
    
    const findArgs = {
      contractAddress: CONTRACT_ADDRESS,
      compiledContract: CompiledBBoardContractContract,
      privateStateId,
      initialPrivateState: { 
        secretKey: reporterSecretHex ? hexToBytes(reporterSecretHex.padStart(64, '0').slice(0, 64)) : new Uint8Array(32),
        merklePath: [new Uint8Array(32), new Uint8Array(32), new Uint8Array(32), new Uint8Array(32), new Uint8Array(32)],
        pathDirections: [false, false, false, false, false],
      }
    };

    const deployedContract = (await findDeployedContract(providers as any, findArgs)) as any;
    
    const tx = await deployedContract.callTx.checkAccess();
    const txId = tx.public.txHash || tx.txHash;

    const cleanId = txId.replace(/^0x/, '');
    const explorerUrl = `https://preprod.midnightexplorer.com/tx/${cleanId}`;

    return { ok: true, txId, explorerUrl };
  } catch (error: unknown) {
    console.error('Onchain error:', error);
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
