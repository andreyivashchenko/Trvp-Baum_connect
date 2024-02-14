import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { deleteApplication, deleteMaster } from '@/app/lib/actions';

export function CreateApplication() {
  return (
    <Link
      href="/dashboard/applications/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Application</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function CreateMaster() {
  return (
    <Link
      href="/dashboard/masters/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Master</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateApplication({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/applications/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function UpdateMaster({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/masters/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteApplication({ id }: { id: string }) {
  const deleteApplicationWithId = deleteApplication.bind(null, id);
  return (
    <form action={deleteApplicationWithId}>
      <button className="rounded-md border p-2 transition hover:bg-red-700 hover:text-white">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}

export function DeleteMaster({ id }: { id: string }) {
  const deleteMasterWithId = deleteMaster.bind(null, id);
  return (
    <form action={deleteMasterWithId}>
      <button className="rounded-md border p-2 transition hover:bg-red-700 hover:text-white">
        <span className="sr-only text-black">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}
