import { Badge } from '@/components/ui/badge';

interface PassFailBadgeProps {
  passed: boolean;
}

export function PassFailBadge({ passed }: PassFailBadgeProps) {
  return (
    <Badge
      className={
        passed
          ? 'bg-blue-100 text-blue-800 border-blue-300'
          : 'bg-orange-100 text-orange-800 border-orange-300'
      }
    >
      {passed ? 'PASS' : 'FAIL'}
    </Badge>
  );
}
