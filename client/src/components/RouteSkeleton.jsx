export default function RouteSkeleton() {
  return (
    <div
      className="flex min-h-screen items-start justify-center bg-paper px-4 py-16 md:px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="w-full max-w-auth" aria-hidden="true">
        <div className="h-8 w-40 rounded-sm bg-sunken motion-safe:animate-pulse" />
        <div className="mt-6 rounded-lg border border-border bg-surface p-6 md:p-8">
          <div className="h-8 w-48 rounded-sm bg-sunken motion-safe:animate-pulse" />
          <div className="mt-8 space-y-5">
            {[0, 1, 2].map((item) => (
              <div key={item}>
                <div className="h-3 w-20 rounded-sm bg-sunken motion-safe:animate-pulse" />
                <div className="mt-2 h-11 rounded-sm bg-sunken motion-safe:animate-pulse" />
              </div>
            ))}
          </div>
          <div className="mt-6 h-11 rounded-sm bg-sunken motion-safe:animate-pulse" />
        </div>
      </div>
    </div>
  );
}
