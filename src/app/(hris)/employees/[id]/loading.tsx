import { Card } from '@/lib/ui';

export default function EmployeeProfileLoading() {
  return (
    <div className="relative flex min-h-full flex-1 animate-pulse gap-x-4">
      {/* Left Employee List Sidebar Skeleton */}
      <aside className="relative hidden shrink-0 basis-72 rounded-lg bg-white p-3 lg:block">
        <div className="flex flex-col gap-y-3">
          <div className="h-9 w-28 rounded-lg bg-gray-200" />
          <div className="h-10 w-full rounded-lg bg-gray-100" />
          <div className="flex flex-col gap-y-2 pt-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-x-3 rounded-lg p-2">
                <div className="size-8 rounded-full bg-gray-200" />
                <div className="h-4 w-32 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Right Main Employee Profile Card Skeleton */}
      <section className="relative z-10 min-w-0 flex-1 shadow-[0_4px_15px_0_rgba(39,55,75,0.06)]">
        <Card className="flex flex-col p-3.5 sm:p-6">
          {/* Header Skeleton */}
          <div className="flex flex-col items-center justify-between gap-y-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-center">
            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
              <div className="size-14 shrink-0 rounded-full bg-gray-200 sm:size-16" />
              <div className="flex flex-col items-center gap-y-1.5 sm:items-start">
                <div className="h-6 w-36 rounded bg-gray-200 sm:w-48" />
                <div className="h-4 w-24 rounded bg-gray-100 sm:w-32" />
              </div>
            </div>
            <div className="flex items-center gap-x-2.5">
              <div className="h-6 w-16 rounded-full bg-gray-200 sm:w-20" />
              <div className="h-7 w-20 rounded-lg bg-gray-100 sm:w-24" />
            </div>
          </div>

          {/* Profile Tabs Skeleton */}
          <div className="flex items-center gap-x-3 overflow-x-auto border-b border-gray-100 py-3 sm:gap-x-6 sm:py-4">
            <div className="h-5 w-14 shrink-0 rounded bg-gray-200 sm:h-6" />
            <div className="h-5 w-14 shrink-0 rounded bg-gray-100 sm:h-6" />
            <div className="h-5 w-20 shrink-0 rounded bg-gray-100 sm:h-6" />
            <div className="h-5 w-14 shrink-0 rounded bg-gray-100 sm:h-6" />
            <div className="h-5 w-20 shrink-0 rounded bg-gray-100 sm:h-6" />
            <div className="h-5 w-14 shrink-0 rounded bg-gray-100 sm:h-6" />
          </div>

          {/* Content Section Skeleton */}
          <div className="flex flex-col gap-y-6 pt-4 sm:gap-y-8 sm:pt-6">
            <div className="flex flex-col gap-y-3">
              <div className="h-5 w-32 rounded bg-gray-200 sm:w-36" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="h-14 rounded-xl bg-gray-100 sm:h-16" />
                <div className="h-14 rounded-xl bg-gray-100 sm:h-16" />
              </div>
            </div>
            <div className="flex flex-col gap-y-3">
              <div className="h-5 w-28 rounded bg-gray-200 sm:w-32" />
              <div className="h-24 w-full rounded-xl bg-gray-100 sm:h-28" />
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
