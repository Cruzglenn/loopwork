import { Card } from '@/lib/ui';

export default function AbsencesLoading() {
  return (
    <div className="flex size-full animate-pulse flex-col gap-y-4">
      <Card className="flex flex-1 flex-col gap-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="h-7 w-32 rounded bg-gray-200" />
          <div className="h-9 w-28 rounded-lg bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="h-24 rounded-xl bg-gray-100" />
          <div className="h-24 rounded-xl bg-gray-100" />
          <div className="h-24 rounded-xl bg-gray-100" />
        </div>
        <div className="space-y-3 pt-4">
          <div className="h-10 w-full rounded-lg bg-gray-200" />
          <div className="h-12 w-full rounded-lg bg-gray-100" />
          <div className="h-12 w-full rounded-lg bg-gray-100" />
        </div>
      </Card>
    </div>
  );
}
