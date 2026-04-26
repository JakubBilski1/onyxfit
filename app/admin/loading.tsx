export default function AdminLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="space-y-3">
        <div className="h-3 w-24 rounded bg-line" />
        <div className="h-10 w-2/3 max-w-xl rounded-md bg-line" />
        <div className="h-3 w-1/2 max-w-md rounded bg-line/70" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[170px] rounded-[14px] border border-line bg-card" />
        ))}
      </div>
    </div>
  );
}
