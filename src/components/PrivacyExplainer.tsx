import React, { useState } from "react";

const rows = [
  {
    data: "Channel label & report counts per category",
    type: "Public ledger",
    disclosed: "Everyone",
    icon: "🌐",
  },
  {
    data: "Spent nullifier set (double-report prevention)",
    type: "Public ledger",
    disclosed: "Everyone",
    icon: "🌐",
  },
  {
    data: "Organization's eligible member Merkle root",
    type: "Public ledger",
    disclosed: "Everyone",
    icon: "🌐",
  },
  {
    data: "Reporter's identity & secret key",
    type: "Private witness",
    disclosed: "No one",
    icon: "🔒",
  },
  {
    data: "Written report content",
    type: "Private (device only)",
    disclosed: "No one — never leaves your device",
    icon: "🔒",
  },
  {
    data: "Link between nullifier and reporter",
    type: "Private witness",
    disclosed: "No one",
    icon: "🔒",
  },
  {
    data: "Membership in the eligible reporter set",
    type: "ZK-proved without revealing",
    disclosed: "Verified by chain, identity hidden",
    icon: "✅",
  },
  {
    data: "Has not already filed in this channel",
    type: "ZK-proved without revealing",
    disclosed: "Verified by chain, identity hidden",
    icon: "✅",
  },
];

const typeColors: Record<string, string> = {
  "Public ledger": "text-amber-400/80",
  "Private witness": "text-emerald-400/80",
  "Private (device only)": "text-emerald-400/80",
  "ZK-proved without revealing": "text-sky-400/80",
};

export function PrivacyExplainer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-parchment/10 rounded-sm bg-parchment/[0.03]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex justify-between items-center px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-mono text-xs text-parchment/70 tracking-wider uppercase">
          🕵️ Privacy Model — what the chain does and does not learn
        </span>
        <span className="font-mono text-parchment/40 text-xs ml-4">{open ? "▲ hide" : "▼ show"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4">
          <p className="text-xs text-parchment/50 leading-relaxed max-w-prose">
            Lantern uses zero-knowledge proofs so that the Midnight network can verify your
            report is legitimate without learning who you are. Below is a precise breakdown of
            every data point and who can see it.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="text-parchment/40 text-left border-b border-parchment/10">
                  <th className="pb-2 pr-4 font-normal">Data point</th>
                  <th className="pb-2 pr-4 font-normal">Type</th>
                  <th className="pb-2 font-normal">Disclosed to</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-parchment/5">
                    <td className="py-2 pr-4 text-parchment/70">
                      {r.icon} {r.data}
                    </td>
                    <td className={`py-2 pr-4 ${typeColors[r.type]}`}>{r.type}</td>
                    <td className="py-2 text-parchment/50">{r.disclosed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: "🌐", label: "Public", desc: "Visible to everyone on-chain" },
              { icon: "🔒", label: "Private", desc: "Never leaves your device or the enclave" },
              { icon: "✅", label: "ZK-Proved", desc: "Verified by the network without revealing" },
            ].map((item) => (
              <div key={item.label} className="border border-parchment/10 rounded-sm p-3">
                <p className="text-base mb-1">{item.icon}</p>
                <p className="font-mono text-[10px] text-parchment/70 font-medium">{item.label}</p>
                <p className="font-mono text-[10px] text-parchment/40 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
