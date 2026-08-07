import { Card } from '@/lib/ui';

export default function DashboardLoading() {
  return (
    <div className="flex size-full animate-pulse flex-col gap-4 p-2 md:p-4">
      <div className="h-6 w-32 rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <div className="h-5 w-28 rounded bg-gray-200" />
            <div className="size-8 rounded-full bg-gray-200" />
          </div>
          <div className="h-10 w-20 rounded bg-gray-200" />
          <div className="h-4 w-36 rounded bg-gray-100" />
        </Card>
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="size-8 rounded-full bg-gray-200" />
          </div>
          <div className="h-10 w-16 rounded bg-gray-200" />
          <div className="h-4 w-40 rounded bg-gray-100" />
        </Card>
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <div className="h-5 w-24 rounded bg-gray-200" />
            <div className="size-8 rounded-full bg-gray-200" />
          </div>
          <div className="h-10 w-24 rounded bg-gray-200" />
          <div className="h-4 w-32 rounded bg-gray-100" />
        </Card>
      </div>
      <Card className="flex flex-1 flex-col gap-4 p-6">
        <div className="h-6 w-40 rounded bg-gray-200" />
        <div className="space-y-3 pt-2">
          <div className="h-12 w-full rounded-lg bg-gray-100" />
          <div className="h-12 w-full rounded-lg bg-gray-100" />
          <div className="h-12 w-full rounded-lg bg-gray-100" />
        </div>
      </Card>
    </div>
  );
}
