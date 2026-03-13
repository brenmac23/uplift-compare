import { PassFailBadge } from '@/components/PassFailBadge';

export function SummaryPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Summary Page</h1>
      <div className="flex gap-4">
        <PassFailBadge passed={true} />
        <PassFailBadge passed={false} />
      </div>
    </div>
  );
}
