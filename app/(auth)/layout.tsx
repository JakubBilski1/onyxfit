import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="onyx-shell min-h-screen flex">
      {/* Left: brand panel with aurora */}
      <aside className="hidden md:flex md:w-1/2 lg:w-[44%] relative overflow-hidden bg-surface border-r border-line">
        <div className="absolute inset-0 onyx-aurora pointer-events-none" />
        {/* floating blobs for "z jajem" */}
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-blob" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-violet/20 blur-3xl animate-blob" style={{ animationDelay: "-9s" }} />

        <div className="relative z-10 flex flex-col justify-between p-12 lg:p-14 w-full">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-violet shadow-soft">
              <Sparkles size={18} strokeWidth={2} className="text-primary-fg" />
            </span>
            <div>
              <div className="text-[18px] font-semibold tracking-tight text-fg leading-none">Onyx</div>
              <div className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-fg-3 mt-1.5">
                Coach Console
              </div>
            </div>
          </div>

          <div className="max-w-md">
            <h2 className="text-[40px] lg:text-[44px] font-semibold tracking-tight text-fg leading-[1.05]">
              The only platform where the program, the meal, the bloodwork and the receipt
              <span className="text-gradient-brand"> meet</span>.
            </h2>
            <p className="mt-5 text-[14px] text-fg-2 leading-relaxed">
              A command center for trainers who treat coaching like a craft —
              not a content channel.
            </p>
          </div>

          <div className="flex items-center justify-between text-[10.5px] font-mono uppercase tracking-[0.2em] text-fg-3">
            <span>EU-hosted · GDPR-native</span>
            <span>v0.1.0</span>
          </div>
        </div>
      </aside>

      {/* Right: form */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md onyx-enter">{children}</div>
      </main>
    </div>
  );
}
