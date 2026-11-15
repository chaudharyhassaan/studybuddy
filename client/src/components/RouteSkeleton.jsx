export default function RouteSkeleton() {
  return (
    <div className="min-h-screen bg-paper px-4 py-16 md:px-6" aria-busy="true" aria-live="polite">
      <div className="mx-auto max-w-content">
        <div aria-hidden="true" className="h-8 w-48 rounded-sm bg-sunken motion-safe:animate-pulse" />
        <div
          aria-hidden="true"
          className="mt-4 h-4 w-72 max-w-full rounded-sm bg-sunken motion-safe:animate-pulse"
        />
        <div
          aria-hidden="true"
          className="mt-10 h-40 w-full rounded-md bg-sunken motion-safe:animate-pulse"
        />
      </div>
    </div>
  );
}
