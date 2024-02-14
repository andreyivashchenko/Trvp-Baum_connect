import Search from '@/app/ui/search';
import { CreateMaster } from '@/app/ui/applications/buttons';
import { lusitana } from '@/app/ui/fonts';
import Table from '@/app/ui/masters/table';
import { fetchMastersPages } from '@/app/lib/data';
import Pagination from '@/app/ui/applications/pagination';
import { Suspense } from 'react';
import { MastersTableSkeleton } from '@/app/ui/skeletons';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchMastersPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Masters</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search masters..." />
        <CreateMaster />
      </div>
      <Suspense key={query + currentPage} fallback={<MastersTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
