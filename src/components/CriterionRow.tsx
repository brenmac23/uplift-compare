import { HelpCircleIcon } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { CRITERION_TOOLTIPS } from '@/lib/criterionTooltips';
import type { CriterionResult } from '../scoring/types';

interface CriterionRowProps {
  criterion: CriterionResult;
  side: 'existing' | 'proposed';
}

/**
 * Single criterion display row showing label, score, max score, and tooltip.
 * Mandatory criteria show a "Mandatory" badge.
 * N/A scores are displayed in muted grey text.
 */
export function CriterionRow({ criterion, side }: CriterionRowProps) {
  const tooltipKey = `${side}:${criterion.id}`;
  const tooltipText = CRITERION_TOOLTIPS[tooltipKey];

  const isNA = criterion.score === 'N/A';
  const scoreDisplay = isNA ? 'N/A' : `${criterion.score}`;
  const maxDisplay = criterion.maxScore === 'N/A' ? '' : `/ ${criterion.maxScore}`;
  const earned = typeof criterion.score === 'number' ? criterion.score : 0;
  const max = typeof criterion.maxScore === 'number' ? criterion.maxScore : 0;
  const isFullScore = !isNA && max > 0 && earned >= max;

  return (
    <div className="flex items-start justify-between gap-2 py-1.5 text-sm">
      {/* Label + tooltip */}
      <div className="flex min-w-0 flex-1 items-start gap-1.5">
        <span className="min-w-0 flex-1 leading-snug text-gray-700">{criterion.label}</span>
        {criterion.mandatory && (
          <Badge className="shrink-0 bg-red-100 text-red-700 border-red-300 text-[10px] px-1 py-0">
            Mandatory
          </Badge>
        )}
        {tooltipText && (
          <Tooltip>
            <TooltipTrigger className="shrink-0 cursor-help">
              <HelpCircleIcon className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
            </TooltipTrigger>
            <TooltipContent side="left">
              {tooltipText}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Score */}
      <div className="shrink-0 text-right font-mono text-xs">
        {isNA ? (
          <span className="text-gray-400">N/A</span>
        ) : (
          <span className={isFullScore ? 'font-semibold text-green-700' : 'text-gray-600'}>
            {scoreDisplay}
            {maxDisplay && (
              <span className="text-gray-400">{maxDisplay}</span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
