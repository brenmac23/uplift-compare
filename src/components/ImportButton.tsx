import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import type { ProjectInputs } from '@/scoring/types';
import { Button } from '@/components/ui/button';

/**
 * Validates that an unknown value matches the required shape of ProjectInputs.
 * Checks required fields and spot-checks optional ones. Missing optional fields
 * are filled with defaults (lenient import).
 */
function isValidProjectInputs(obj: unknown): obj is ProjectInputs {
  if (typeof obj !== 'object' || obj === null) return false;
  const p = obj as Record<string, unknown>;

  // Required fields with correct types
  if (typeof p.projectName !== 'string') return false;
  if (typeof p.qnzpe !== 'number') return false;
  if (p.productionType !== 'film' && p.productionType !== 'tv') return false;

  // Spot-check a few more critical fields to confirm shape
  if ('hasSustainabilityPlan' in p && typeof p.hasSustainabilityPlan !== 'boolean') return false;
  if ('castPercent' in p && typeof p.castPercent !== 'number') return false;

  return true;
}

/**
 * Fills in missing optional ProjectInputs fields with safe defaults.
 * This allows importing partial JSON (e.g. only the fields that matter for a scenario).
 */
function fillDefaults(raw: Record<string, unknown>): ProjectInputs {
  return {
    projectName: raw.projectName as string,
    productionType: raw.productionType as 'film' | 'tv',
    qnzpe: raw.qnzpe as number,

    hasSustainabilityPlan: (raw.hasSustainabilityPlan as boolean) ?? false,
    hasSustainabilityOfficer: (raw.hasSustainabilityOfficer as boolean) ?? false,
    hasCarbonReview: (raw.hasCarbonReview as boolean) ?? false,
    hasStudioLease: (raw.hasStudioLease as boolean) ?? false,
    hasPreviousQNZPE: (raw.hasPreviousQNZPE as boolean) ?? false,
    hasAssociatedContent: (raw.hasAssociatedContent as boolean) ?? false,
    shootingNZPercent: (raw.shootingNZPercent as number) ?? 0,
    regionalPercent: (raw.regionalPercent as number) ?? 0,
    picturePostPercent: (raw.picturePostPercent as number) ?? 0,
    soundPostPercent: (raw.soundPostPercent as number) ?? 0,
    vfxPercent: (raw.vfxPercent as number) ?? 0,
    conceptPhysicalPercent: (raw.conceptPhysicalPercent as number) ?? 0,
    castPercent: (raw.castPercent as number) ?? 0,
    crewPercent: (raw.crewPercent as number) ?? 0,
    maoriCrewPercent: (raw.maoriCrewPercent as number) ?? 0,
    atlCount: (raw.atlCount as number) ?? 0,
    btlKeyCount: (raw.btlKeyCount as number) ?? 0,
    btlAdditionalCount: (raw.btlAdditionalCount as number) ?? 0,
    hasLeadCast: (raw.hasLeadCast as boolean) ?? false,
    supportingCastCount: (raw.supportingCastCount as number) ?? 0,
    castingLevel: (raw.castingLevel as 'none' | 'associate' | 'director') ?? 'none',
    hasLeadCastMaori: (raw.hasLeadCastMaori as boolean) ?? false,
    hasMasterclass: (raw.hasMasterclass as boolean) ?? false,
    hasIndustrySeminars: (raw.hasIndustrySeminars as boolean) ?? false,
    hasEdSeminars: (raw.hasEdSeminars as boolean) ?? false,
    attachmentCount: (raw.attachmentCount as number) ?? 0,
    internshipCount: (raw.internshipCount as number) ?? 0,
    hasKnowledgeTransfer: (raw.hasKnowledgeTransfer as boolean) ?? false,
    commercialAgreementPercent: (raw.commercialAgreementPercent as number) ?? 0,
    infrastructureInvestment: (raw.infrastructureInvestment as number) ?? 0,
    premiereType: (raw.premiereType as 'none' | 'nz' | 'world') ?? 'none',
    hasNZPremiere: (raw.hasNZPremiere as boolean) ?? false,
    hasIntlPromotion: (raw.hasIntlPromotion as boolean) ?? false,
    hasFilmMarketing: (raw.hasFilmMarketing as boolean) ?? false,
    hasTourismMarketing: (raw.hasTourismMarketing as boolean) ?? false,
    hasTourismPartnership: (raw.hasTourismPartnership as boolean) ?? false,
    hasLocationAnnouncement: (raw.hasLocationAnnouncement as boolean) ?? false,
  };
}

export function ImportButton() {
  const addProject = useAppStore((s) => s.addProject);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleButtonClick() {
    setError(null);
    fileInputRef.current?.click();
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);

        if (!isValidProjectInputs(parsed)) {
          setError('Invalid project file: missing required fields (projectName, qnzpe, productionType)');
          // Reset file input so the same file can be re-selected after fixing
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        const inputs = fillDefaults(parsed as unknown as Record<string, unknown>);
        const generatedId = crypto.randomUUID();
        addProject(inputs, generatedId);
        navigate(`/project/${generatedId}`);
      } catch {
        setError('Could not parse JSON file. Please ensure the file contains valid JSON.');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Import project JSON file"
      />
      <Button size="sm" variant="outline" onClick={handleButtonClick}>
        Import
      </Button>
      {error && (
        <div className="absolute top-full right-0 mt-1 w-72 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 shadow-md z-50">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700 font-bold"
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
