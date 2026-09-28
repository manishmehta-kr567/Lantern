import { useState, useEffect } from "react";

export function ZkVisualizer() {
  const [nodes, setNodes] = useState<number[]>([]);

  useEffect(() => {
    // Fill initial nodes
    setNodes(Array.from({ length: 20 }, () => Math.random()));

    const interval = setInterval(() => {
      setNodes((prev) => {
        const next = [...prev.slice(1), Math.random()];
        return next;
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="col-span-1 sm:col-span-2 border border-parchment/10 bg-dark-surface p-6 sm:p-8 relative overflow-hidden group hover:border-parchment/30 transition-all duration-700">
      {/* Dynamic background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-4 max-w-sm w-full">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full absolute animate-ping opacity-75" />
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full relative z-10" />
            </div>
            <h3 className="font-display text-lg text-parchment tracking-wide">Zero-Knowledge Shield</h3>
          </div>
          <p className="text-sm text-parchment/60 leading-relaxed font-mono">
            Cryptographic verification is active. Your local enclave proves eligibility to the Midnight network using ZK-SNARKs. Your identity, secret key, and report details never leave this device.
          </p>
        </div>

        <div className="flex-1 w-full flex items-center justify-end gap-1.5 h-32 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-dark-surface to-transparent w-1/4 z-10 pointer-events-none" />
          
          {nodes.map((n, i) => (
            <div 
              key={i}
              className="w-1.5 bg-parchment/30 rounded-t-sm transition-all duration-500 ease-out"
              style={{ 
                height: `${15 + n * 85}%`,
                opacity: 0.1 + (i / nodes.length) * 0.9,
                backgroundColor: n > 0.85 ? 'rgba(168, 85, 247, 0.6)' : undefined // occasional purple spike
              }}
            />
          ))}
          
          <div className="absolute inset-0 bg-gradient-to-b from-dark-surface/80 via-transparent to-dark-surface/80 pointer-events-none z-10" />
        </div>
      </div>
    </div>
  );
}
