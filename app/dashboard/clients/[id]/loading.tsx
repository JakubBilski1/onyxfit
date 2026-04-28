export default function ClientDetailLoading() {
  return (
    <div className="space-y-12 animate-pulse">
      <div className="h-3 w-24 rounded bg-line" />

      <div className="space-y-4">
        <div className="h-3 w-40 rounded bg-line" />
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-full bg-line" />
          <div className="h-9 w-72 max-w-full rounded-md bg-line" />
        </div>
        <div className="h-3 w-2/3 max-w-md rounded bg-line/70" />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[170px] rounded-[14px] border border-line bg-card"
          />
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-3">
            <div className="h-6 w-40 rounded bg-line" />
            <div className="h-[220px] rounded-[14px] border border-line bg-card" />
          </div>
          <div className="space-y-3">
            <div className="h-6 w-48 rounded bg-line" />
            <div className="h-[180px] rounded-[14px] border border-line bg-card" />
          </div>
        </div>
        <aside className="space-y-8">
          <div className="space-y-3">
            <div className="h-6 w-32 rounded bg-line" />
            <div className="h-[260px] rounded-[14px] border border-line bg-card" />
          </div>
          <div className="space-y-3">
            <div className="h-6 w-28 rounded bg-line" />
            <div className="h-[160px] rounded-[14px] border border-line bg-card" />
          </div>
        </aside>
      </section>
    </div>
  );
}
