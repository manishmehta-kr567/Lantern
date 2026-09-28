import { WalletStatus } from "../lib/midnightWallet";

function truncate(addr: string) {
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

export function Header({
  status, address, walletName, error, onConnect, onDisconnect,
}: {
  status: WalletStatus;
  address: string | null;
  walletName: string | null;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <header className="border-b border-parchment/10">
      <div className="mx-auto max-w-3xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="26" height="26" viewBox="0 0 64 64" className="shrink-0">
            <path d="M24 20 H40 V46 H24 Z" fill="none" stroke="#EDEAE0" strokeWidth="2" />
            <path d="M28 12 H36 L40 20 H24 Z" fill="none" stroke="#EDEAE0" strokeWidth="2" />
            <circle cx="32" cy="33" r="5" fill="#D97A3D" />
          </svg>
          <div>
            <p className="font-display text-xl text-parchment leading-none">Lantern</p>
            <p className="font-mono text-[11px] text-parchment/45 mt-1">first quarter · midnight builder challenge</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {status === "connected" ? (
            <button onClick={onDisconnect} className="font-mono text-xs text-forest-light border border-forest/50 rounded px-3 py-1.5 hover:bg-forest/10 transition-colors">
              {walletName ?? "wallet"} · {address ? truncate(address) : "connected"}
            </button>
          ) : (
            <button onClick={onConnect} disabled={status === "connecting"} className="font-mono text-xs text-parchment border border-parchment/25 rounded px-3 py-1.5 hover:border-ember hover:text-ember-light transition-colors disabled:opacity-50">
              {status === "connecting" ? "connecting…" : "connect wallet"}
            </button>
          )}
          {status === "unavailable" && <p className="text-[11px] text-parchment/40 max-w-[240px] text-right">{error}</p>}
          {status === "error" && error && <p className="text-[11px] text-ember-light max-w-[240px] text-right">{error}</p>}
        </div>
      </div>
    </header>
  );
}
