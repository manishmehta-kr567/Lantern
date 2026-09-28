export function PrivacyLedger() {
  return (
    <div className="border border-parchment/12 rounded-sm p-6">
      <h3 className="font-display text-lg text-parchment mb-4">What an observer can see</h3>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <p className="font-mono text-[11px] text-forest-light mb-2">public</p>
          <ul className="space-y-1.5 text-sm text-parchment/75">
            <li>· the channel's label</li>
            <li>· how many reports per category</li>
            <li>· how many included written detail</li>
            <li>· the set of spent nullifiers</li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-[11px] text-ember-light mb-2">private</p>
          <ul className="space-y-1.5 text-sm text-parchment/75">
            <li>· who filed any report</li>
            <li>· the text of every report</li>
            <li>· which reporter chose which category</li>
            <li>· any wallet-to-report linkage</li>
          </ul>
        </div>
      </div>
      <div className="mt-5 pt-5 border-t border-parchment/10">
        <p className="text-sm text-parchment/60 leading-relaxed">
          Each report proves, in zero-knowledge, that the caller is a verified member who hasn't filed here before —{" "}
          <em className="not-italic text-parchment/80">without revealing who they are or what they wrote</em>.
        </p>
      </div>
    </div>
  );
}
