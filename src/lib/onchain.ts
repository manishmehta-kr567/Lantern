import { getDeployment } from './contractClient';
import { connectWallet } from './midnightWallet';

// Helper to convert a hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export type OnChainResult =
  | { ok: true; txId: string; explorerUrl: string }
  | { ok: false; error: string };

// Simple WitnessContext interface matching what the Compact runtime passes
interface WitnessContext<PS> {
  privateState: PS;
}

export async function submitReportOnChain(
  reporterSecretHex: string,
  _category: number,
  _hasDetails: boolean
): Promise<OnChainResult> {
  try {
    const [
      { indexerPublicDataProvider },
      { httpClientProofProvider },
      { levelPrivateStateProvider },
      { FetchZkConfigProvider },
      { findDeployedContract },
      { CompiledContract },
      { CompiledBBoardContractContract },
      { setNetworkId },

      { toHex, fromHex },
    ] = await Promise.all([
      import('@midnight-ntwrk/midnight-js-indexer-public-data-provider'),
      import('@midnight-ntwrk/midnight-js-http-client-proof-provider'),
      import('@midnight-ntwrk/midnight-js-level-private-state-provider'),
      import('@midnight-ntwrk/midnight-js-fetch-zk-config-provider'),
      import('@midnight-ntwrk/midnight-js-contracts'),
      import('@midnight-ntwrk/midnight-js-protocol/compact-js'),
      import('@midnight-ntwrk/bboard-contract'),
      import('@midnight-ntwrk/midnight-js-network-id'),

      import('@midnight-ntwrk/midnight-js-utils'),
    ]);

    setNetworkId('preprod');

    const deployment = getDeployment();
    if (!deployment.address) throw new Error("Contract not deployed");
    const CONTRACT_ADDRESS = deployment.address;

    const indexerHttp = 'https://indexer.preprod.midnight.network/api/v4/graphql';
    const indexerWs = 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws';
    const zkConfigPath = `${window.location.origin}/managed/bboard`;
    const ONEAM_PROOF_SERVER = 'https://api-preprod.1am.xyz';

    // Connect wallet
    const { address, api } = await connectWallet();
    const ap = api as unknown as Record<string, unknown>;
    const coinPublicKey = address;
    if (!coinPublicKey) throw new Error('Could not retrieve wallet coin public key.');

    let shieldedCoinPk = coinPublicKey;
    let shieldedEncPk = coinPublicKey;

    if (typeof ap?.getShieldedAddresses === 'function') {
      try {
        const addresses = await (ap.getShieldedAddresses as () => Promise<{
          shieldedCoinPublicKey?: string;
          shieldedEncryptionPublicKey?: string;
        }>)();
        if (addresses?.shieldedCoinPublicKey) shieldedCoinPk = addresses.shieldedCoinPublicKey;
        if (addresses?.shieldedEncryptionPublicKey) shieldedEncPk = addresses.shieldedEncryptionPublicKey;
      } catch (err) {
        console.warn('Could not retrieve shielded addresses:', err);
      }
    }

    const secretBytes = hexToBytes(reporterSecretHex.padStart(64, '0').slice(0, 64));

    // Inline witnesses matching the gatecheck.compact circuit signatures exactly:
    //   witness secretKey(): Bytes<32>
    //   witness merklePath(): Vector<5, Bytes<32>>
    //   witness pathDirections(): Vector<5, Boolean>
    const witnesses = {
      secretKey: <PS>(ctx: WitnessContext<PS>): [PS, Uint8Array] =>
        [ctx.privateState, secretBytes],
      merklePath: <PS>(ctx: WitnessContext<PS>): [PS, Uint8Array[]] =>
        [ctx.privateState, [
          new Uint8Array(32),
          new Uint8Array(32),
          new Uint8Array(32),
          new Uint8Array(32),
          new Uint8Array(32),
        ]],
      pathDirections: <PS>(ctx: WitnessContext<PS>): [PS, boolean[]] =>
        [ctx.privateState, [false, false, false, false, false]],
    };

    // Attach custom witnesses to the existing compiled contract using CompiledContract.withWitnesses
    // This is the correct pattern — don't rebuild the contract from scratch
    type CompiledContractTarget = Parameters<typeof findDeployedContract>[1]['compiledContract'];
    const withWitnessesFn = CompiledContract.withWitnesses as unknown as (
      w: typeof witnesses
    ) => (contract: unknown) => CompiledContractTarget;
    const compiledContract = withWitnessesFn(witnesses)(CompiledBBoardContractContract);

    const zkConfigProvider = new FetchZkConfigProvider(zkConfigPath, fetch.bind(window));
    const proofProvider = httpClientProofProvider(ONEAM_PROOF_SERVER, zkConfigProvider);

    let submittedTxId: string | null = null;

    const walletProvider = {
      getCoinPublicKey(): string { return shieldedCoinPk; },
      getEncryptionPublicKey(): string { return shieldedEncPk; },
      balanceTx: async (tx: { serialize: () => Uint8Array }, _ttl?: Date) => {
        const serializedTx = toHex(tx.serialize());

        if (typeof ap?.balanceUnsealedTransaction === 'function') {
          try {
            console.log('Balancing transaction via 1AM wallet balanceUnsealedTransaction...');
            const received = await (ap.balanceUnsealedTransaction as (s: string) => Promise<{ tx: string }>)(serializedTx);
            console.log('Wallet balanced transaction successfully!');
            return (tx.constructor as unknown as { deserialize: (s: string, p: string, b: string, raw: Uint8Array) => unknown }).deserialize(
              'signature',
              'pre-proof',
              'pre-binding',
              fromHex(received.tx)
            );
          } catch (walletBalErr) {
            console.warn('Wallet balanceUnsealedTransaction failed, falling back to /balance-only:', walletBalErr);
          }
        }

        // Fallback: use 1AM ProofStation's /balance-only endpoint for fee sponsorship
        console.log('Balancing transaction via ProofStation /balance-only...');
        const txBytes = tx.serialize();
        const balanceResp = await fetch(`${ONEAM_PROOF_SERVER}/balance-only`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: txBytes as unknown as BodyInit,
        });
        if (balanceResp.ok) {
          const { txBytes: balancedHex } = await balanceResp.json() as { txBytes: string };
          return (tx.constructor as unknown as { deserialize: (s: string, p: string, b: string, raw: Uint8Array) => unknown }).deserialize('signature', 'pre-proof', 'pre-binding', fromHex(balancedHex));
        }

        const errBody = await balanceResp.json().catch(() => ({})) as { error?: string };
        throw new Error(`/balance-only failed (${balanceResp.status}): ${errBody.error ?? balanceResp.statusText}`);
      },
    };

    const midnightProvider = {
      submitTx: async (tx: { serialize: () => Uint8Array }) => {
        const txHex = toHex(tx.serialize());
        if (typeof ap?.submitTransaction === 'function') {
          const res = await (ap.submitTransaction as (s: string) => Promise<unknown>)(txHex);
          const r = res as Record<string, string>;
          const returnedId = typeof res === 'string' ? res : (r?.txHash || r?.hash || r?.id || '');
          submittedTxId = returnedId.replace(/^0x/, '');
          return submittedTxId;
        }
        throw new Error('Connected wallet does not support submitting transactions.');
      }
    };

    const privateStateId = `lantern-reporter-${secretBytes.slice(0, 8).join('')}`;
    const privateStateProvider = levelPrivateStateProvider({
      privateStateStoreName: `lantern-private-state`,
      signingKeyStoreName: `lantern-signing-keys`,
      privateStoragePasswordProvider: () => "TempPassword123!Secure",
      accountId: coinPublicKey,
    });

    const initialPrivateState = {
      secretKey: secretBytes,
      merklePath: [new Uint8Array(32), new Uint8Array(32), new Uint8Array(32), new Uint8Array(32), new Uint8Array(32)],
      pathDirections: [false, false, false, false, false],
    };

    const providers: Record<string, unknown> = {
      privateStateProvider,
      publicDataProvider: indexerPublicDataProvider(indexerHttp, indexerWs),
      zkConfigProvider,
      proofProvider,
      walletProvider,
      midnightProvider,
    };

    const contract = await findDeployedContract(providers as never, {
      contractAddress: CONTRACT_ADDRESS,
      compiledContract,
      privateStateId,
      initialPrivateState,
    });

    await privateStateProvider.set(privateStateId, initialPrivateState);

    // Race the callTx with early return once submission is confirmed
    const deployedContract = contract as unknown as {
      callTx: { checkAccess: () => Promise<{ public: { txHash: string }; txHash: string }> }
    };

    const callPromise = deployedContract.callTx.checkAccess();
    const earlyReturnPromise = new Promise<{ early: true }>((resolve) => {
      const check = setInterval(() => {
        if (submittedTxId) {
          clearInterval(check);
          setTimeout(() => resolve({ early: true }), 2000);
        }
      }, 500);
    });

    const result = await Promise.race([callPromise, earlyReturnPromise]);

    let txId = '';
    if ('early' in result) {
      txId = submittedTxId || '';
    } else {
      txId = (result as { public: { txHash: string }; txHash: string }).public?.txHash ||
             (result as { public: { txHash: string }; txHash: string }).txHash || submittedTxId || '';
    }

    const cleanId = txId.replace(/^0x/, '');
    const explorerUrl = `https://explorer.1am.xyz/tx/${cleanId}?network=preprod`;

    return { ok: true, txId: cleanId, explorerUrl };
  } catch (error: unknown) {
    console.error('Onchain error:', error);
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
