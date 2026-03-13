import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { scoreExisting } from '@/scoring/scoreExisting';
import { scoreProposed } from '@/scoring/scoreProposed';
import { SECTION_ALIGNMENT, findSection } from '@/lib/sectionAlignment';
import { SectionBlock } from '@/components/SectionBlock';
import { CriterionRow } from '@/components/CriterionRow';
import { PassFailBadge } from '@/components/PassFailBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ProjectInputs } from '@/scoring/types';

// ── Helper: Label wrapper for inputs ─────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-gray-600 mb-0.5">{children}</label>;
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="mb-3">{children}</div>;
}

function SystemTag({ label }: { label: string }) {
  return (
    <span className="ml-1 text-[10px] text-gray-400 font-normal">({label})</span>
  );
}

// ── Inputs column: grouped by section slot ────────────────────────────────────

interface InputsColumnProps {
  inputs: ProjectInputs;
  onChange: (updated: Partial<ProjectInputs>) => void;
}

function InputsColumn({ inputs, onChange }: InputsColumnProps) {
  const set = (partial: Partial<ProjectInputs>) => onChange(partial);

  return (
    <div className="flex flex-col gap-3">

      {/* Slot 0: Sustainability (existing only) */}
      <SectionBlock title="Sustainability" subtitle="Existing test only">
        <FieldRow>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.hasSustainabilityPlan}
              onChange={e => set({ hasSustainabilityPlan: e.target.checked })}
              className="rounded border-gray-300"
            />
            Sustainability Action Plan & Report
            <SystemTag label="Existing only" />
          </label>
        </FieldRow>
        <FieldRow>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.hasSustainabilityOfficer}
              onChange={e => set({ hasSustainabilityOfficer: e.target.checked })}
              className="rounded border-gray-300"
            />
            Sustainability Officer
            <SystemTag label="Existing only" />
          </label>
        </FieldRow>
        <FieldRow>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.hasCarbonReview}
              onChange={e => set({ hasCarbonReview: e.target.checked })}
              className="rounded border-gray-300"
            />
            Carbon Emissions Review
            <SystemTag label="Existing only" />
          </label>
        </FieldRow>
      </SectionBlock>

      {/* Slot 1: NZ Production Activity */}
      <SectionBlock title="NZ Production Activity">
        <FieldRow>
          <FieldLabel>Production Type</FieldLabel>
          <select
            value={inputs.productionType}
            onChange={e => set({ productionType: e.target.value as ProjectInputs['productionType'] })}
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="film">Film</option>
            <option value="tv">TV</option>
          </select>
        </FieldRow>
        <FieldRow>
          <FieldLabel>QNZPE (NZD)</FieldLabel>
          <input
            type="number"
            min={0}
            value={inputs.qnzpe}
            onChange={e => set({ qnzpe: Number(e.target.value) })}
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FieldRow>
        <FieldRow>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.hasStudioLease}
              onChange={e => set({ hasStudioLease: e.target.checked })}
              className="rounded border-gray-300"
            />
            NZ Studio Lease ≥3 years
            <SystemTag label="Existing only" />
          </label>
        </FieldRow>
        <FieldRow>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.hasPreviousQNZPE}
              onChange={e => set({ hasPreviousQNZPE: e.target.checked })}
              className="rounded border-gray-300"
            />
            Previous QNZPE ≥$100m
          </label>
        </FieldRow>
        <FieldRow>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.hasAssociatedContent}
              onChange={e => set({ hasAssociatedContent: e.target.checked })}
              className="rounded border-gray-300"
            />
            Associated Content (sequel/prequel/spin-off)
          </label>
        </FieldRow>
        <FieldRow>
          <FieldLabel>Shooting in NZ (%)</FieldLabel>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={100}
              value={inputs.shootingNZPercent}
              onChange={e => set({ shootingNZPercent: Number(e.target.value) })}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
        </FieldRow>
        <FieldRow>
          <FieldLabel>Regional Shooting (%)</FieldLabel>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={100}
              value={inputs.regionalPercent}
              onChange={e => set({ regionalPercent: Number(e.target.value) })}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
        </FieldRow>
        <FieldRow>
          <FieldLabel>Picture Post-Production in NZ (%)</FieldLabel>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={100}
              value={inputs.picturePostPercent}
              onChange={e => set({ picturePostPercent: Number(e.target.value) })}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
        </FieldRow>
        <FieldRow>
          <FieldLabel>Sound Post-Production in NZ (%)</FieldLabel>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={100}
              value={inputs.soundPostPercent}
              onChange={e => set({ soundPostPercent: Number(e.target.value) })}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
        </FieldRow>
        <FieldRow>
          <FieldLabel>VFX / Digital Effects in NZ (%)</FieldLabel>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={100}
              value={inputs.vfxPercent}
              onChange={e => set({ vfxPercent: Number(e.target.value) })}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
        </FieldRow>
        <FieldRow>
          <FieldLabel>Concept Design & Physical Effects in NZ (%)</FieldLabel>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={100}
              value={inputs.conceptPhysicalPercent}
              onChange={e => set({ conceptPhysicalPercent: Number(e.target.value) })}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
        </FieldRow>
      </SectionBlock>

      {/* Slot 2: NZ Personnel */}
      <SectionBlock title="NZ Personnel">
        <FieldRow>
          <FieldLabel>Cast (% Qualifying Persons)</FieldLabel>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={100}
              value={inputs.castPercent}
              onChange={e => set({ castPercent: Number(e.target.value) })}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
        </FieldRow>
        <FieldRow>
          <FieldLabel>Crew (% Qualifying Persons)</FieldLabel>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={100}
              value={inputs.crewPercent}
              onChange={e => set({ crewPercent: Number(e.target.value) })}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
        </FieldRow>
        <FieldRow>
          <FieldLabel>Māori Crew (% of QP crew)</FieldLabel>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={100}
              value={inputs.maoriCrewPercent}
              onChange={e => set({ maoriCrewPercent: Number(e.target.value) })}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500">% <SystemTag label="Existing only" /></span>
          </div>
        </FieldRow>
        <FieldRow>
          <FieldLabel>Above-the-Line Crew (# of QPs, max 3)</FieldLabel>
          <input
            type="number"
            min={0}
            max={3}
            value={inputs.atlCount}
            onChange={e => set({ atlCount: Number(e.target.value) })}
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FieldRow>
        <FieldRow>
          <FieldLabel>BTL Key Crew (# of QPs — DOP, AD, Editor, etc.)</FieldLabel>
          <input
            type="number"
            min={0}
            value={inputs.btlKeyCount}
            onChange={e => set({ btlKeyCount: Number(e.target.value) })}
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FieldRow>
        <FieldRow>
          <FieldLabel>BTL Additional Crew (# of QPs)</FieldLabel>
          <input
            type="number"
            min={0}
            value={inputs.btlAdditionalCount}
            onChange={e => set({ btlAdditionalCount: Number(e.target.value) })}
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FieldRow>
        <FieldRow>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.hasLeadCast}
              onChange={e => set({ hasLeadCast: e.target.checked })}
              className="rounded border-gray-300"
            />
            Lead Cast (1 QP)
          </label>
        </FieldRow>
        <FieldRow>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.hasLeadCastMaori}
              onChange={e => set({ hasLeadCastMaori: e.target.checked })}
              className="rounded border-gray-300"
            />
            Lead Cast or ATL Crew is Māori
            <SystemTag label="Existing only" />
          </label>
        </FieldRow>
        <FieldRow>
          <FieldLabel>Supporting Cast (# of QPs, max 3)</FieldLabel>
          <input
            type="number"
            min={0}
            max={3}
            value={inputs.supportingCastCount}
            onChange={e => set({ supportingCastCount: Number(e.target.value) })}
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Casting Level</FieldLabel>
          <select
            value={inputs.castingLevel}
            onChange={e => set({ castingLevel: e.target.value as ProjectInputs['castingLevel'] })}
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="none">None</option>
            <option value="associate">Associate (1pt)</option>
            <option value="director">Director (2pts)</option>
          </select>
        </FieldRow>
      </SectionBlock>

      {/* Slot 3: Skills & Talent Development */}
      <SectionBlock title="Skills & Talent Dev.">
        <FieldRow>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.hasMasterclass}
              onChange={e => set({ hasMasterclass: e.target.checked })}
              className="rounded border-gray-300"
            />
            Masterclass to NZ Screen Sector
            <SystemTag label="Existing only" />
          </label>
        </FieldRow>
        <FieldRow>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.hasIndustrySeminars}
              onChange={e => set({ hasIndustrySeminars: e.target.checked })}
              className="rounded border-gray-300"
            />
            Industry Seminars
            <SystemTag label="Proposed only" />
          </label>
        </FieldRow>
        <FieldRow>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.hasEdSeminars}
              onChange={e => set({ hasEdSeminars: e.target.checked })}
              className="rounded border-gray-300"
            />
            Educational Seminars
          </label>
        </FieldRow>
        <FieldRow>
          <FieldLabel>Attachment Positions (# of QPs)</FieldLabel>
          <input
            type="number"
            min={0}
            value={inputs.attachmentCount}
            onChange={e => set({ attachmentCount: Number(e.target.value) })}
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FieldRow>
        <FieldRow>
          <FieldLabel>Internships (# of QPs)</FieldLabel>
          <input
            type="number"
            min={0}
            value={inputs.internshipCount}
            onChange={e => set({ internshipCount: Number(e.target.value) })}
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FieldRow>
      </SectionBlock>

      {/* Slot 4: Innovation & Infrastructure (existing only) */}
      <SectionBlock title="Innovation & Infra." subtitle="Existing test only">
        <FieldRow>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.hasKnowledgeTransfer}
              onChange={e => set({ hasKnowledgeTransfer: e.target.checked })}
              className="rounded border-gray-300"
            />
            Knowledge Transfer
            <SystemTag label="Existing only" />
          </label>
        </FieldRow>
        <FieldRow>
          <FieldLabel>Commercial Agreement (% of QNZPE)</FieldLabel>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={inputs.commercialAgreementPercent}
              onChange={e => set({ commercialAgreementPercent: Number(e.target.value) })}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500">% <SystemTag label="Existing only" /></span>
          </div>
        </FieldRow>
        <FieldRow>
          <FieldLabel>Infrastructure Investment (NZD)</FieldLabel>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              value={inputs.infrastructureInvestment}
              onChange={e => set({ infrastructureInvestment: Number(e.target.value) })}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <SystemTag label="Existing only" />
          </div>
        </FieldRow>
      </SectionBlock>

      {/* Slot 5: Marketing & Showcasing */}
      <SectionBlock title="Marketing & Showcasing">
        <FieldRow>
          <FieldLabel>Premiere Type</FieldLabel>
          <select
            value={inputs.premiereType}
            onChange={e => set({ premiereType: e.target.value as ProjectInputs['premiereType'] })}
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="none">None</option>
            <option value="nz">NZ Premiere (2pts)</option>
            <option value="world">World Premiere in NZ (3pts)</option>
          </select>
          <p className="mt-0.5 text-[10px] text-gray-400">(Existing only)</p>
        </FieldRow>
        <FieldRow>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.hasNZPremiere}
              onChange={e => set({ hasNZPremiere: e.target.checked })}
              className="rounded border-gray-300"
            />
            NZ Premiere
            <SystemTag label="Proposed only" />
          </label>
        </FieldRow>
        <FieldRow>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.hasIntlPromotion}
              onChange={e => set({ hasIntlPromotion: e.target.checked })}
              className="rounded border-gray-300"
            />
            International Promotional Activities
            <SystemTag label="Proposed only" />
          </label>
        </FieldRow>
        <FieldRow>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.hasFilmMarketing}
              onChange={e => set({ hasFilmMarketing: e.target.checked })}
              className="rounded border-gray-300"
            />
            Film Marketing Partnership (NZFC)
          </label>
        </FieldRow>
        <FieldRow>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.hasTourismMarketing}
              onChange={e => set({ hasTourismMarketing: e.target.checked })}
              className="rounded border-gray-300"
            />
            Tourism Marketing Partnership (TNZ)
            <SystemTag label="Existing only" />
          </label>
        </FieldRow>
        <FieldRow>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.hasTourismPartnership}
              onChange={e => set({ hasTourismPartnership: e.target.checked })}
              className="rounded border-gray-300"
            />
            Bespoke Tourism NZ Partnership
          </label>
        </FieldRow>
        <FieldRow>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.hasLocationAnnouncement}
              onChange={e => set({ hasLocationAnnouncement: e.target.checked })}
              className="rounded border-gray-300"
            />
            Location Announcement
            <SystemTag label="Proposed only" />
          </label>
        </FieldRow>
      </SectionBlock>
    </div>
  );
}

// ── Score column: renders aligned section slots ───────────────────────────────

interface ScoreColumnProps {
  result: { sections: ReturnType<typeof scoreExisting>['sections'] } & ReturnType<typeof scoreExisting>;
  side: 'existing' | 'proposed';
}

function ScoreColumn({ result, side }: ScoreColumnProps) {
  return (
    <div className="flex flex-col gap-3">
      {SECTION_ALIGNMENT.map((slot, idx) => {
        const section = findSection(result, side === 'existing' ? slot.existingSectionId : slot.proposedSectionId);

        if (!section) {
          return (
            <div
              key={idx}
              className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-400"
            >
              No equivalent in {side === 'existing' ? 'existing' : 'proposed'} test
            </div>
          );
        }

        const subtitle = `${section.totalPoints} / ${section.maxPoints} pts`;

        return (
          <SectionBlock
            key={idx}
            title={`Section ${section.id}: ${section.label}`}
            subtitle={subtitle}
          >
            <div className="divide-y divide-gray-100">
              {section.criteria.map((criterion) => (
                <CriterionRow key={criterion.id} criterion={criterion} side={side} />
              ))}
            </div>
          </SectionBlock>
        );
      })}
    </div>
  );
}

// ── DetailPage ────────────────────────────────────────────────────────────────

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projects = useAppStore((s) => s.projects);
  const updateProject = useAppStore((s) => s.updateProject);

  const project = projects.find((p) => p.id === id);

  // Local inputs state for live scoring — initialised from project.inputs
  const [inputs, setInputs] = useState<ProjectInputs | null>(project?.inputs ?? null);

  // When navigating to a different project, reset local state to that project's inputs
  useEffect(() => {
    if (project) {
      setInputs(project.inputs);
    }
  }, [id, project]);

  // Live scoring — recomputes whenever inputs change
  const existingResult = useMemo(
    () => (inputs ? scoreExisting(inputs) : null),
    [inputs]
  );
  const proposedResult = useMemo(
    () => (inputs ? scoreProposed(inputs) : null),
    [inputs]
  );

  // Handle input change: update local state AND persist to store
  const handleChange = (partial: Partial<ProjectInputs>) => {
    if (!inputs || !id) return;
    const updated = { ...inputs, ...partial };
    setInputs(updated);
    updateProject(id, updated);
  };

  if (!project || !inputs || !existingResult || !proposedResult) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-gray-700 mb-2">Project not found</p>
        <p className="text-sm text-gray-500 mb-6">The project ID "{id}" does not exist.</p>
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          Back to summary
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Project Switcher */}
      <div className="border-b bg-white px-4 py-3">
        <div className="mx-auto max-w-7xl flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">Project:</span>
          <Select
            value={id}
            onValueChange={(newId) => navigate(`/project/${newId}`)}
          >
            <SelectTrigger className="min-w-48 max-w-xs">
              <SelectValue>{project.inputs.projectName}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.inputs.projectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link to="/" className="ml-auto text-xs text-gray-400 hover:text-gray-600 hover:underline">
            All projects
          </Link>
        </div>
      </div>

      {/* Sticky Score Header */}
      <div className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {/* Inputs column header */}
            <div className="flex items-center">
              <span className="text-sm font-semibold text-gray-500">Inputs</span>
            </div>

            {/* Existing column header */}
            <div className="flex flex-col gap-1 rounded-lg bg-blue-50 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
                  Existing Test
                </span>
                <PassFailBadge passed={existingResult.passed} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-blue-900">
                  {existingResult.totalPoints}
                  <span className="text-sm font-normal text-blue-600"> / {existingResult.maxPoints}</span>
                </span>
                <span className="text-xs text-blue-500">
                  threshold: {existingResult.passThreshold}pts
                </span>
              </div>
              {!existingResult.mandatoryMet && (
                <p className="text-xs font-medium text-red-600">
                  Mandatory criterion not met (A1 — Sustainability Plan required)
                </p>
              )}
            </div>

            {/* Proposed column header */}
            <div className="flex flex-col gap-1 rounded-lg bg-violet-50 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-violet-800 uppercase tracking-wide">
                  Proposed Test
                </span>
                <PassFailBadge passed={proposedResult.passed} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-violet-900">
                  {proposedResult.totalPoints}
                  <span className="text-sm font-normal text-violet-600"> / {proposedResult.maxPoints}</span>
                </span>
                <span className="text-xs text-violet-500">
                  threshold: {proposedResult.passThreshold}pts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Three-column body */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Left: Inputs */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Inputs
            </h2>
            <InputsColumn inputs={inputs} onChange={handleChange} />
          </div>

          {/* Middle: Existing scores */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-600">
              Existing Test — Score Breakdown
            </h2>
            <ScoreColumn result={existingResult} side="existing" />
          </div>

          {/* Right: Proposed scores */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-violet-600">
              Proposed Test — Score Breakdown
            </h2>
            <ScoreColumn result={proposedResult} side="proposed" />
          </div>
        </div>
      </div>
    </div>
  );
}
