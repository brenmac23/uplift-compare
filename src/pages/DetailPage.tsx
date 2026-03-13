import { useParams } from 'react-router-dom';

export function DetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Detail Page for project {id}</h1>
    </div>
  );
}
