import { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface SectionBlockProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

/**
 * Collapsible section wrapper with a chevron toggle.
 * Expanded by default. Shows title in semibold with optional subtitle.
 */
export function SectionBlock({ title, subtitle, children }: SectionBlockProps) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border bg-white shadow-sm">
      <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-left">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-gray-900">{title}</span>
          {subtitle && (
            <span className="text-xs text-gray-500">{subtitle}</span>
          )}
        </div>
        <ChevronDownIcon
          className={cn(
            'h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t px-4 py-3">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
