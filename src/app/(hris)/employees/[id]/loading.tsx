import { Card } from '@/lib/ui';

export default function EmployeeProfileLoading() {
  return (
    <div className="relative flex min-h-full flex-1 animate-pulse">
      <section className="relative z-10 flex-1 shadow-[0_4px_15px_0_rgba(39,55,75,0.06)]">
        <Card className="flex flex-col p-6">
          <div className="flex flex-col items-center justify-between gap-y-4 border-b border-gray-100 pb-6 lg:flex-row lg:items-center">
            <div className="flex items-center gap-x-4">
              <div className="size-16 rounded-full bg-gray-200" />
              <div className="flex flex-col gap-y-2">
                <div className="h-6 w-44 rounded bg-gray-200" />
                <div className="h-4 w-28 rounded bg-gray-100" />
              </div>
            </div>
            <div className="h-7 w-20 rounded-full bg-gray-200" />
          </div>
          <div className="flex items-center gap-x-6 border-b border-gray-100 py-4">
            <div className="h-5 w-16 rounded bg-gray-200" />
            <div className="h-5 w-20 rounded bg-gray-100" />
            <div className="h-5 w-20 rounded bg-gray-100" />
            <div className="h-5 w-24 rounded bg-gray-100" />
          </div>
          <div className="flex flex-col gap-y-8 pt-6">
            <div className="flex flex-col gap-y-3">
              <div className="h-5 w-32 rounded bg-gray-200" />
              <div className="h-32 w-full rounded-xl bg-gray-100" />
            </div>
            <div className="flex flex-col gap-y-3">
              <div className="h-5 w-28 rounded bg-gray-200" />
              <div className="h-28 w-full rounded-xl bg-gray-100" />
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
