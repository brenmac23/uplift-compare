import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { ProjectInputs } from '../scoring/types';

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

export function CreateProjectForm() {
  const addProject = useAppStore((s) => s.addProject);
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

    addProject(inputs);
    setForm(DEFAULT_FORM);
    setErrors({});
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <h3>Add New Project</h3>

      <div>
        <label htmlFor="projectName">Project Name</label>
        <br />
        <input
          id="projectName"
          type="text"
          value={form.projectName}
          onChange={(e) => setForm({ ...form, projectName: e.target.value })}
        />
        {errors.projectName && (
          <span style={{ color: 'red', marginLeft: '0.5rem' }}>
            {errors.projectName}
          </span>
        )}
      </div>

      <div style={{ marginTop: '0.5rem' }}>
        <label htmlFor="qnzpe">QNZPE ($M NZD)</label>
        <br />
        <input
          id="qnzpe"
          type="number"
          min="1"
          value={form.qnzpe}
          onChange={(e) => setForm({ ...form, qnzpe: e.target.value })}
        />
        {errors.qnzpe && (
          <span style={{ color: 'red', marginLeft: '0.5rem' }}>
            {errors.qnzpe}
          </span>
        )}
      </div>

      <div style={{ marginTop: '0.5rem' }}>
        <label htmlFor="productionType">Production Type</label>
        <br />
        <select
          id="productionType"
          value={form.productionType}
          onChange={(e) =>
            setForm({ ...form, productionType: e.target.value as 'film' | 'tv' })
          }
        >
          <option value="film">Film</option>
          <option value="tv">TV</option>
        </select>
      </div>

      <div style={{ marginTop: '0.75rem' }}>
        <button type="submit">Add Project</button>
      </div>
    </form>
  );
}
