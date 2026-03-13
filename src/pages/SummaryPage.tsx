import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import {
  useFilteredProjects,
  type PassFailFilter,
  type TypeFilter,
  type BudgetFilter,
} from '@/hooks/useFilteredProjects';
import { PassFailBadge } from '@/components/PassFailBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatQnzpe(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}m`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}k`;
  }
  return `$${amount.toLocaleString()}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SummaryPage() {
  const navigate = useNavigate();

  // Filter state
  const [passFilter, setPassFilter] = useState<PassFailFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [budgetFilter, setBudgetFilter] = useState<BudgetFilter>('all');

  const { filtered, stats } = useFilteredProjects(passFilter, typeFilter, budgetFilter);

  const hasActiveFilters =
    passFilter !== 'all' || typeFilter !== 'all' || budgetFilter !== 'all';

  function clearFilters() {
    setPassFilter('all');
    setTypeFilter('all');
    setBudgetFilter('all');
  }

  // ── Stat card click handlers ─────────────────────────────────────────────

  function handleExistingPassClick() {
    setPassFilter(passFilter === 'existing-pass' ? 'all' : 'existing-pass');
    setTypeFilter('all');
    setBudgetFilter('all');
  }

  function handleProposedPassClick() {
    setPassFilter(passFilter === 'proposed-pass' ? 'all' : 'proposed-pass');
    setTypeFilter('all');
    setBudgetFilter('all');
  }

  function handleBothPassClick() {
    setPassFilter(passFilter === 'both-pass' ? 'all' : 'both-pass');
    setTypeFilter('all');
    setBudgetFilter('all');
  }

  function handleTotalClick() {
    clearFilters();
  }

  return (
    <div className="p-4 md:p-8 space-y-6">

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

        {/* Existing Pass */}
        <Card
          className={[
            'cursor-pointer select-none transition-all hover:shadow-md hover:ring-2',
            passFilter === 'existing-pass'
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'hover:ring-blue-300',
          ].join(' ')}
          onClick={handleExistingPassClick}
        >
          <CardHeader className="pb-0">
            <CardTitle className="text-xs text-muted-foreground font-normal">
              Existing Pass
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{stats.existingPass}</span>
              <span className="text-sm text-muted-foreground">/ {stats.total}</span>
              <PassFailBadge passed={true} />
            </div>
          </CardContent>
        </Card>

        {/* Proposed Pass */}
        <Card
          className={[
            'cursor-pointer select-none transition-all hover:shadow-md hover:ring-2',
            passFilter === 'proposed-pass'
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'hover:ring-blue-300',
          ].join(' ')}
          onClick={handleProposedPassClick}
        >
          <CardHeader className="pb-0">
            <CardTitle className="text-xs text-muted-foreground font-normal">
              Proposed Pass
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{stats.proposedPass}</span>
              <span className="text-sm text-muted-foreground">/ {stats.total}</span>
              <PassFailBadge passed={true} />
            </div>
          </CardContent>
        </Card>

        {/* Both Pass */}
        <Card
          className={[
            'cursor-pointer select-none transition-all hover:shadow-md hover:ring-2',
            passFilter === 'both-pass'
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'hover:ring-blue-300',
          ].join(' ')}
          onClick={handleBothPassClick}
        >
          <CardHeader className="pb-0">
            <CardTitle className="text-xs text-muted-foreground font-normal">
              Both Pass
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{stats.bothPass}</span>
              <span className="text-sm text-muted-foreground">/ {stats.total}</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Projects */}
        <Card
          className={[
            'cursor-pointer select-none transition-all hover:shadow-md hover:ring-2',
            !hasActiveFilters
              ? 'ring-2 ring-foreground/20'
              : 'hover:ring-foreground/20',
          ].join(' ')}
          onClick={handleTotalClick}
        >
          <CardHeader className="pb-0">
            <CardTitle className="text-xs text-muted-foreground font-normal">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <span className="text-2xl font-bold">{stats.total}</span>
          </CardContent>
        </Card>

      </div>

      {/* ── Filter Bar ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Status filter */}
        <Select value={passFilter} onValueChange={(v) => setPassFilter(v as PassFailFilter)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="existing-pass">Existing Pass</SelectItem>
            <SelectItem value="existing-fail">Existing Fail</SelectItem>
            <SelectItem value="proposed-pass">Proposed Pass</SelectItem>
            <SelectItem value="proposed-fail">Proposed Fail</SelectItem>
            <SelectItem value="both-pass">Both Pass</SelectItem>
          </SelectContent>
        </Select>

        {/* Type filter */}
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="film">Film</SelectItem>
            <SelectItem value="tv">TV</SelectItem>
          </SelectContent>
        </Select>

        {/* Budget filter */}
        <Select value={budgetFilter} onValueChange={(v) => setBudgetFilter(v as BudgetFilter)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Budget" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All budgets</SelectItem>
            <SelectItem value="under-100m">Under $100m</SelectItem>
            <SelectItem value="over-100m">$100m+</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}

        <span className="text-sm text-muted-foreground ml-auto">
          Showing {filtered.length} project{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Project Table ───────────────────────────────────────────────── */}
      <div className="rounded-xl ring-1 ring-foreground/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="pl-4">Project Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>QNZPE</TableHead>
              <TableHead>Existing Score</TableHead>
              <TableHead>Proposed Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-12"
                >
                  No projects match the current filters.
                </TableCell>
              </TableRow>
            )}
            {filtered.map(({ project, existing, proposed }) => (
              <TableRow
                key={project.id}
                className="cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                {/* Project Name */}
                <TableCell className="pl-4 font-medium max-w-[200px] truncate">
                  <span title={project.inputs.projectName}>
                    {project.inputs.projectName}
                  </span>
                </TableCell>

                {/* Type */}
                <TableCell className="capitalize">
                  {project.inputs.productionType}
                </TableCell>

                {/* QNZPE */}
                <TableCell className="font-mono text-sm">
                  {formatQnzpe(project.inputs.qnzpe)}
                </TableCell>

                {/* Existing score */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      {existing.totalPoints}/{existing.maxPoints}
                    </span>
                    <PassFailBadge passed={existing.passed} />
                    {!existing.mandatoryMet && (
                      <AlertTriangle
                        className="size-4 text-orange-500"
                        aria-label="Mandatory criterion not met"
                      />
                    )}
                  </div>
                </TableCell>

                {/* Proposed score */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      {proposed.totalPoints}/{proposed.maxPoints}
                    </span>
                    <PassFailBadge passed={proposed.passed} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
