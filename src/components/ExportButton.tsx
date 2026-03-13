import { useState } from 'react';
import { Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { exportXlsx } from '@/lib/exportXlsx';

/**
 * NavBar button that exports all projects to a .xlsx file.
 * - Disabled when no projects exist
 * - Briefly shows a Check icon for 1.5s after a successful export as feedback
 * - Always exports all projects regardless of any active filters
 */
export function ExportButton() {
  const projects = useAppStore((s) => s.projects);
  const [done, setDone] = useState(false);

  function handleExport() {
    exportXlsx(projects);
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleExport}
      disabled={projects.length === 0}
    >
      {done ? (
        <Check className="h-4 w-4" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span className="ml-1">Export</span>
    </Button>
  );
}
