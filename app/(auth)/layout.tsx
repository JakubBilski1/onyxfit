export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="onyx-shell min-h-screen onyx-grain flex">
      {/* Left: hero panel */}
      <aside className="hidden md:flex md:w-1/2 lg:w-2/5 border-r border-onyx-line p-12 flex-col justify-between">
        <div>
          <div className="onyx-display text-5xl text-onyx-bone leading-none">Onyx</div>
          <div className="onyx-label mt-3">A command center for elite trainers.</div>
        </div>
        <blockquote className="max-w-md">
          <p className="onyx-display text-[28px] text-onyx-bone leading-tight">
            &ldquo;The only platform where the program, the meal, the bloodwork, and the receipt
            <em className="onyx-signal not-italic"> meet</em>.&rdquo;
          </p>
          <footer className="mt-4 onyx-label">— Onyx Manifesto</footer>
        </blockquote>
        <div className="flex items-center justify-between font-mono text-[10px] text-onyx-dim">
          <span>EU-HOSTED · GDPR-NATIVE</span>
          <span>v0.1.0</span>
        </div>
      </aside>

      {/* Right: form */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
