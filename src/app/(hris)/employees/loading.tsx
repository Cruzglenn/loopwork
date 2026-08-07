import { Card } from '@/lib/ui';

export default function EmployeesLoading() {
  return (
    <div className="flex size-full animate-pulse flex-col gap-y-4">
      <Card className="flex flex-1 flex-col gap-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="h-7 w-36 rounded bg-gray-200" />
          <div className="h-9 w-32 rounded-lg bg-gray-200" />
        </div>
        <div className="flex items-center gap-x-4 py-2">
          <div className="h-10 w-full max-w-sm rounded-lg bg-gray-100" />
          <div className="h-9 w-24 rounded-lg bg-gray-100" />
        </div>
        <div className="space-y-3 pt-4">
          <div className="h-10 w-full rounded-lg bg-gray-200" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex h-14 items-center justify-between rounded-lg bg-gray-100 px-4">
              <div className="flex items-center gap-x-3">
                <div className="size-9 rounded-full bg-gray-200" />
                <div className="h-4 w-32 rounded bg-gray-200" />
              </div>
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="h-6 w-16 rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
