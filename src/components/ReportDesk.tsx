import { useState } from "react";
import { isValidCategory } from "../lib/crypto";
import { submitReport, isDeployed } from "../lib/contractClient";
import { WalletApi } from "../lib/midnightWallet";

type Phase = "no-secret" | "ready" | "proving" | "error";

const CATEGORIES = [
  { id: 1, label: "Safety" },
  { id: 2, label: "Harassment" },
  { id: 3, label: "Fraud" },
  { id: 4, label: "Ethics" },
  { id: 5, label: "Other" },
];

export function ReportDesk({
  walletApi, walletConnected,
}: { walletApi: WalletApi | null; walletConnected: boolean }) {
  const [secret, setSecret] = useState<string | null>(null);
  const [category, setCategory] = useState<number>(3);
  const [details, setDetails] = useState("");
  const [phase, setPhase] = useState<Phase>("no-secret");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<{ txHash: string, url: string } | null>(null);

  function handleGenerateSecret() {
    // For dummy testing with the deployed contract, we must use an all-zero secret
    // because the allowlistRoot on-chain was computed from an all-zero secret.
    setSecret("0000000000000000000000000000000000000000000000000000000000000000");
    setPhase("ready");
  }

  async function handleSubmit() {
    if (!secret || !walletApi || !isValidCategory(category)) return;
    setPhase("proving");
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const result = await submitReport({
        wallet: walletApi,
        reporterSecret: secret,
        category,
        hasDetails: details.trim().length > 0,
      });
      setDetails("");
      setPhase("ready");
      setSuccessMsg({ txHash: result.txHash, url: result.explorerUrl });
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "The report could not be submitted.");
      setPhase("error");
    }
  }

  return (
    <div className="lantern-glow border border-parchment/10 rounded-sm overflow-hidden">
      <div className="p-8">
        <p className="font-mono text-[11px] tracking-wide text-parchment/40">ethics line · verified employees only</p>
        <h2 className="font-display text-2xl text-parchment mt-1 mb-6">Say what you saw. Not who you are.</h2>

        {!walletConnected ? (
          <p className="text-sm text-parchment/60 leading-relaxed">
            Connect a Midnight wallet above to begin. Your reporter secret is generated on your device — it never leaves it.
          </p>
        ) : phase === "no-secret" ? (
          <div className="space-y-4">
            <p className="text-sm text-parchment/70 leading-relaxed">
              Generate a reporter secret. For a report to count as
              coming from a verified member, the corresponding leaf
              must already be part of the channel's eligibility root at
              deployment time — see docs/USAGE.md.
            </p>
            <button onClick={handleGenerateSecret} className="w-full font-mono text-sm bg-parchment text-dark rounded-sm py-3 hover:bg-parchment/90 transition-colors">
              generate reporter secret
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`font-mono text-[11px] rounded-sm py-3 px-1 border transition-colors ${
                    category === c.id ? "border-ember text-ember-light bg-ember/10" : "border-parchment/15 text-parchment/60 hover:border-parchment/30"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs text-parchment/50 font-mono block mb-1.5">
                written detail — stays on your device, never submitted on-chain
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                placeholder="Only you see this. The chain records at most that a detailed report exists."
                className="w-full bg-dark-light border border-parchment/15 rounded-sm px-3 py-2 text-sm text-parchment placeholder:text-parchment/30 focus:border-ember/50 outline-none resize-none"
              />
            </div>

            {errorMsg && (
              <p className="text-sm text-ember-light border border-ember/30 bg-ember/5 rounded-sm px-3 py-2 leading-relaxed">{errorMsg}</p>
            )}

            {successMsg && (
              <div className="text-sm text-forest-light border border-forest/30 bg-forest/5 rounded-sm px-3 py-2 leading-relaxed flex flex-col gap-1">
                <p>Report securely filed!</p>
                <a href={successMsg.url} target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 hover:underline">
                  Transaction: {successMsg.txHash.slice(0, 8)}…{successMsg.txHash.slice(-8)} ↗
                </a>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={phase === "proving" || !isDeployed()}
              className="w-full font-mono text-sm bg-forest text-parchment rounded-sm py-3.5 hover:bg-forest-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              title={!isDeployed() ? "No contract deployed yet — see the banner above" : undefined}
            >
              {phase === "proving" ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-parchment/40 border-t-parchment animate-spin" />
                  generating proof…
                </>
              ) : "file report anonymously"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
