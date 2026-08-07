import { Card } from '@/lib/ui';

export default function PayrollLoading() {
  return (
    <div className="flex size-full animate-pulse flex-col gap-y-4">
      <Card className="flex flex-1 flex-col gap-y-6 p-3.5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="h-7 w-28 rounded bg-gray-200" />
          <div className="h-9 w-36 rounded-lg bg-gray-200" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="h-20 rounded-xl bg-gray-100 sm:h-24" />
          <div className="h-20 rounded-xl bg-gray-100 sm:h-24" />
          <div className="h-20 rounded-xl bg-gray-100 sm:h-24" />
          <div className="h-20 rounded-xl bg-gray-100 sm:h-24" />
        </div>
        <div className="space-y-3 pt-2">
          <div className="h-10 w-full rounded-lg bg-gray-200" />
          <div className="h-12 w-full rounded-lg bg-gray-100" />
          <div className="h-12 w-full rounded-lg bg-gray-100" />
        </div>
      </Card>
    </div>
  );
}
