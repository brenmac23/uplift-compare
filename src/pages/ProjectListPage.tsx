import { useAppStore } from '../store/useAppStore';
import { CreateProjectForm } from '../components/CreateProjectForm';

function formatDollars(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}m`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}k`;
  }
  return `$${amount.toLocaleString()}`;
}

export function ProjectListPage() {
  const projects = useAppStore((s) => s.projects);
  const resetToDefaults = useAppStore((s) => s.resetToDefaults);

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Uplift Compare</h1>

      <CreateProjectForm />

      <div style={{ marginBottom: '0.5rem' }}>
        <button onClick={resetToDefaults}>Reset to defaults</button>
        <span style={{ marginLeft: '1rem', color: '#666' }}>
          Showing {projects.length} projects
        </span>
      </div>

      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.25rem 0.5rem', borderBottom: '1px solid #ccc' }}>
              Project Name
            </th>
            <th style={{ textAlign: 'left', padding: '0.25rem 0.5rem', borderBottom: '1px solid #ccc' }}>
              Type
            </th>
            <th style={{ textAlign: 'right', padding: '0.25rem 0.5rem', borderBottom: '1px solid #ccc' }}>
              QNZPE
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td style={{ padding: '0.25rem 0.5rem' }}>
                {project.inputs.projectName}
              </td>
              <td style={{ padding: '0.25rem 0.5rem' }}>
                {project.inputs.productionType}
              </td>
              <td style={{ padding: '0.25rem 0.5rem', textAlign: 'right' }}>
                {formatDollars(project.inputs.qnzpe)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
