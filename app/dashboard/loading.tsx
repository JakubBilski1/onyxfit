export default function DashboardLoading() {
  return (
    <div className="space-y-12 animate-pulse">
      <div className="space-y-3">
        <div className="h-3 w-24 bg-onyx-line/60" />
        <div className="h-10 w-2/3 max-w-xl bg-onyx-line/50" />
        <div className="h-3 w-1/2 max-w-md bg-onyx-line/40" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-28 border border-onyx-line bg-onyx-line/10" />
        <div className="h-28 border border-onyx-line bg-onyx-line/10" />
        <div className="h-28 border border-onyx-line bg-onyx-line/10" />
        <div className="h-28 border border-onyx-line bg-onyx-line/10" />
      </div>
    </div>
  );
}
