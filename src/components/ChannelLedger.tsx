import { isDeployed } from "../lib/contractClient";

const CATEGORIES = ["Safety", "Harassment", "Fraud", "Ethics", "Other"];

export function ChannelLedger() {
  const deployed = isDeployed();
  return (
    <div className="border border-parchment/12 rounded-sm p-6">
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="font-display text-lg text-parchment">Channel ledger</h3>
        <span className="font-mono text-[11px] text-parchment/40">{deployed ? "live · on-chain" : "awaiting deployment"}</span>
      </div>
      <div className="space-y-3">
        {CATEGORIES.map((label) => (
          <div key={label} className="flex justify-between items-center text-sm">
            <span className="text-parchment/70">{label}</span>
            <span className="font-mono text-xs text-parchment/40">{deployed ? "reads from managed/lantern" : "—"}</span>
          </div>
        ))}
      </div>
      <p className="font-mono text-[11px] text-parchment/35 mt-5 pt-5 border-t border-parchment/10">
        Category counts come from the contract's public ledger state — this panel does not compute or estimate them locally.
      </p>
    </div>
  );
}
