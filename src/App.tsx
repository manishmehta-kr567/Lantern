import { Header } from "./components/Header";
import { DeploymentBanner } from "./components/DeploymentBanner";
import { ReportDesk } from "./components/ReportDesk";
import { ZkVisualizer } from "./components/ZkVisualizer";
import { useMidnightWallet } from "./hooks/useMidnightWallet";
import { getDeployment } from "./lib/contractClient";

function App() {
  const wallet = useMidnightWallet();
  const deployment = getDeployment();

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <Header status={wallet.status} address={wallet.address} walletName={wallet.walletName} error={wallet.error} onConnect={wallet.connect} onDisconnect={wallet.disconnect} />
      <main className="flex-1 mx-auto max-w-3xl w-full px-6 py-12">
        <section className="mb-8">
          <p className="font-mono text-[11px] text-parchment/40 mb-3">🌓 first quarter — half light, half shadow</p>
          <h1 className="font-display text-3xl sm:text-4xl text-parchment leading-tight max-w-xl">Shine a light on the problem. Keep the hand that holds it dark.</h1>
          <p className="text-parchment/60 mt-3 max-w-lg leading-relaxed">
            Lantern lets verified members report incidents without being identified. Every report is a real transaction, checked against a deployed Midnight contract, never simulated locally.
          </p>
        </section>
        <DeploymentBanner deployment={deployment} />
        <section className="mb-10">
          <ReportDesk walletApi={wallet.walletApi} walletConnected={wallet.status === "connected"} />
        </section>
        <section className="grid gap-6">
          <ZkVisualizer />
        </section>
      </main>
      <footer className="border-t border-parchment/10">
        <div className="mx-auto max-w-3xl px-6 py-6 flex flex-col sm:flex-row justify-between gap-2">
          <p className="font-mono text-[11px] text-parchment/35">built on midnight · compact contracts</p>
          <p className="font-mono text-[11px] text-parchment/35">level 3 · first quarter submission</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
