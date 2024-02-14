import Form from '@/app/ui/applications/create-form';
import Breadcrumbs from '@/app/ui/applications/breadcrumbs';
import { fetchMasters } from '@/app/lib/data';

export default async function Page() {
  const masters = await fetchMasters();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Applications', href: '/dashboard/applications' },
          {
            label: 'Create Application',
            href: '/dashboard/applications/create',
            active: true,
          },
        ]}
      />
      <Form masters={masters} />
    </main>
  );
}
