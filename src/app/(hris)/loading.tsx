import { Card } from '@/lib/ui';

export default function Loading() {
  return (
    <div className="flex size-full animate-pulse flex-col gap-y-4 p-2 sm:p-4">
      <div className="h-7 w-36 rounded-lg bg-gray-200 sm:h-8 sm:w-48" />
      <Card className="flex flex-1 flex-col gap-y-6 p-3.5 sm:p-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="h-6 w-36 rounded bg-gray-200" />
          <div className="h-9 w-28 rounded-lg bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="h-24 rounded-xl bg-gray-100 sm:h-28" />
          <div className="h-24 rounded-xl bg-gray-100 sm:h-28" />
          <div className="h-24 rounded-xl bg-gray-100 sm:h-28" />
        </div>
        <div className="flex-1 space-y-3 pt-4">
          <div className="h-10 w-full rounded-lg bg-gray-100" />
          <div className="h-12 w-full rounded-lg bg-gray-100" />
          <div className="h-12 w-full rounded-lg bg-gray-100" />
          <div className="h-12 w-full rounded-lg bg-gray-100" />
        </div>
      </Card>
    </div>
  );
}
