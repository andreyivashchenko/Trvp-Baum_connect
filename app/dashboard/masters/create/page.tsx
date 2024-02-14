import Form from '@/app/ui/masters/create-form';
import Breadcrumbs from '@/app/ui/applications/breadcrumbs';

export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Masters', href: '/dashboard/masters' },
          {
            label: 'Add Master',
            href: '/dashboard/masters/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}
