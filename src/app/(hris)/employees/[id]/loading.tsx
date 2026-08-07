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
      <section className="relative z-10 flex-1 shadow-[0_4px_15px_0_rgba(39,55,75,0.06)]">
        <Card className="flex flex-col p-6">
          {/* Header Skeleton (Avatar, Name, Job Title, Status Pill) */}
          <div className="flex flex-col items-start justify-between gap-y-4 border-b border-gray-100 pb-6 lg:flex-row lg:items-center">
            <div className="flex items-center gap-x-4">
              <div className="size-16 rounded-full bg-gray-200" />
              <div className="flex flex-col gap-y-2">
                <div className="h-7 w-48 rounded bg-gray-200" />
                <div className="h-4 w-32 rounded bg-gray-100" />
              </div>
            </div>
            <div className="flex items-center gap-x-3">
              <div className="h-7 w-20 rounded-full bg-gray-200" />
              <div className="h-8 w-24 rounded-lg bg-gray-100" />
            </div>
          </div>

          {/* Profile Tabs Skeleton */}
          <div className="flex items-center gap-x-6 overflow-x-auto border-b border-gray-100 py-4">
            <div className="h-6 w-16 rounded bg-gray-200" />
            <div className="h-6 w-16 rounded bg-gray-100" />
            <div className="h-6 w-20 rounded bg-gray-100" />
            <div className="h-6 w-16 rounded bg-gray-100" />
            <div className="h-6 w-20 rounded bg-gray-100" />
            <div className="h-6 w-16 rounded bg-gray-100" />
          </div>

          {/* Content Section Skeleton */}
          <div className="flex flex-col gap-y-8 pt-6">
            <div className="flex flex-col gap-y-3">
              <div className="h-5 w-36 rounded bg-gray-200" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="h-16 rounded-xl bg-gray-100" />
                <div className="h-16 rounded-xl bg-gray-100" />
              </div>
            </div>
            <div className="flex flex-col gap-y-3">
              <div className="h-5 w-32 rounded bg-gray-200" />
              <div className="h-28 w-full rounded-xl bg-gray-100" />
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
