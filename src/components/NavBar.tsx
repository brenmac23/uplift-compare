import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { ImportButton } from '@/components/ImportButton';
import { ExportButton } from '@/components/ExportButton';

export function NavBar() {
  const projects = useAppStore((s) => s.projects);
  const firstProjectId = projects[0]?.id;
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors"
          >
            Uplift Compare
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              Summary
            </Link>
            {firstProjectId ? (
              <Link
                to={`/project/${firstProjectId}`}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
              >
                Detail
              </Link>
            ) : (
              <span className="text-sm font-medium text-gray-400 px-3 py-1.5 rounded-md cursor-not-allowed">
                Detail
              </span>
            )}
            <Button size="sm" variant="outline" onClick={() => setModalOpen(true)}>
              New Project
            </Button>
            <ImportButton />
            <ExportButton />
          </div>
        </div>
      </nav>
      {/* Spacer to prevent content hiding under fixed nav */}
      <div className="h-14" />
      <CreateProjectModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
