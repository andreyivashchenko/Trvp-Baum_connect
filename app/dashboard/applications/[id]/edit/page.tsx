import Form from '@/app/ui/applications/edit-form';
import Breadcrumbs from '@/app/ui/applications/breadcrumbs';
import { fetchApplicationById, fetchMasters } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const [application, masters] = await Promise.all([
    fetchApplicationById(id),
    fetchMasters(),
  ]);

  if (!application) {
    notFound();
  }
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Applications', href: '/dashboard/applications' },
          {
            label: 'Edit Application',
            href: `/dashboard/applications/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form application={application} masters={masters} />
    </main>
  );
}
