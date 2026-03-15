export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-main">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Restoraninizin genel durumunu buradan takip edebilirsiniz.
        </p>
      </div>

      {/* Placeholder for KPI cards - will be built in a later subtask */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="h-4 w-24 rounded bg-white/10" />
            <div className="mt-4 h-8 w-16 rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
