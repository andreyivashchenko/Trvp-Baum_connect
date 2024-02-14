import Form from '@/app/ui/masters/edit-form';
import Breadcrumbs from '@/app/ui/applications/breadcrumbs';
import { fetchMasterById } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const master = await fetchMasterById(id);

  if (!master) {
    notFound();
  }
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Masters', href: '/dashboard/masters' },
          {
            label: 'Edit Master',
            href: `/dashboard/masters/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form master={master} />
    </main>
  );
}
