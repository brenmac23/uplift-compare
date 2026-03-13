import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import type { ProjectInputs } from '@/scoring/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormState {
  projectName: string;
  qnzpe: string;
  productionType: 'film' | 'tv';
}

const DEFAULT_FORM: FormState = {
  projectName: '',
  qnzpe: '',
  productionType: 'film',
};

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const addProject = useAppStore((s) => s.addProject);
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  function validate(): boolean {
    const newErrors: Partial<FormState> = {};
    if (!form.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    const qnzpeNum = Number(form.qnzpe);
    if (!form.qnzpe || isNaN(qnzpeNum) || qnzpeNum <= 0) {
      newErrors.qnzpe = 'QNZPE must be a positive number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const inputs: ProjectInputs = {
      projectName: form.projectName.trim(),
      productionType: form.productionType,
      qnzpe: Number(form.qnzpe) * 1_000_000,

      // All scoring fields default to zero/false/none
      hasSustainabilityPlan: false,
      hasSustainabilityOfficer: false,
      hasCarbonReview: false,
      hasStudioLease: false,
      hasPreviousQNZPE: false,
      hasAssociatedContent: false,
      shootingNZPercent: 0,
      regionalPercent: 0,
      picturePostPercent: 0,
      soundPostPercent: 0,
      vfxPercent: 0,
      conceptPhysicalPercent: 0,
      castPercent: 0,
      crewPercent: 0,
      maoriCrewPercent: 0,
      atlCount: 0,
      btlKeyCount: 0,
      btlAdditionalCount: 0,
      hasLeadCast: false,
      supportingCastCount: 0,
      castingLevel: 'none',
      hasLeadCastMaori: false,
      hasMasterclass: false,
      hasIndustrySeminars: false,
      hasEdSeminars: false,
      attachmentCount: 0,
      internshipCount: 0,
      hasKnowledgeTransfer: false,
      commercialAgreementPercent: 0,
      infrastructureInvestment: 0,
      premiereType: 'none',
      hasNZPremiere: false,
      hasIntlPromotion: false,
      hasFilmMarketing: false,
      hasTourismMarketing: false,
      hasTourismPartnership: false,
      hasLocationAnnouncement: false,
    };

    const generatedId = crypto.randomUUID();
    addProject(inputs, generatedId);
    onOpenChange(false);
    setForm(DEFAULT_FORM);
    setErrors({});
    navigate(`/project/${generatedId}`);
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      setForm(DEFAULT_FORM);
      setErrors({});
    }
    onOpenChange(newOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label
              htmlFor="modal-projectName"
              className="text-sm font-medium text-gray-700"
            >
              Project Name
            </label>
            <input
              id="modal-projectName"
              type="text"
              value={form.projectName}
              onChange={(e) => setForm({ ...form, projectName: e.target.value })}
              placeholder="e.g. My Production"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.projectName && (
              <p className="text-sm text-red-600">{errors.projectName}</p>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="modal-qnzpe"
              className="text-sm font-medium text-gray-700"
            >
              QNZPE ($M NZD)
            </label>
            <input
              id="modal-qnzpe"
              type="number"
              min="0.1"
              step="0.1"
              value={form.qnzpe}
              onChange={(e) => setForm({ ...form, qnzpe: e.target.value })}
              placeholder="e.g. 100"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.qnzpe && (
              <p className="text-sm text-red-600">{errors.qnzpe}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Production Type
            </label>
            <Select
              value={form.productionType}
              onValueChange={(v) =>
                setForm({ ...form, productionType: v as 'film' | 'tv' })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="film">Film</SelectItem>
                <SelectItem value="tv">TV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
