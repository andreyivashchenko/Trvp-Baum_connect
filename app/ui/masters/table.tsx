import Image from 'next/image';
import { fetchFilteredMasters } from '@/app/lib/data';
import { DeleteMaster, UpdateMaster } from '@/app/ui/applications/buttons';

export default async function MastersTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const masters = await fetchFilteredMasters(query, currentPage);

  return (
    <div className="w-full">
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
              <div className="md:hidden">
                {masters?.map((master) => (
                  <div
                    key={master.id}
                    className="mb-2 w-full rounded-md bg-white p-4"
                  >
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <div className="mb-2 flex items-center">
                          <div className="flex items-center gap-3">
                            <Image
                              src={master.image_url}
                              className="rounded-full"
                              alt={`${master.name}'s profile picture`}
                              width={28}
                              height={28}
                            />
                            <p>{master.name}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">{master.email}</p>
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-between border-b py-5">
                      <div className="flex w-1/3 flex-col">
                        <p className="text-xs">Pending</p>
                        <p className="font-medium">{master.total_pending}</p>
                      </div>
                      <div className="flex w-1/3 flex-col">
                        <p className="text-xs">Paid</p>
                        <p className="font-medium">{master.total_paid}</p>
                      </div>
                      <div className="flex w-1/3 flex-col">
                        <p className="text-xs">Workload</p>
                        <p className="font-medium">
                          {master.total_workload}/{master.workload}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="text-sm">
                        <p>{master.total_invoices} applications</p>
                      </div>
                      <div className="flex justify-end gap-3">
                        <UpdateMaster id={master.id} />
                        <DeleteMaster id={master.id} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <table className="hidden min-w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Total Applications
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Total Pending
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Total Paid
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Workload
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {masters.map((master) => (
                    <tr key={master.id} className="group">
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <Image
                            src={master.image_url}
                            className="rounded-full"
                            alt={`${master.name}'s profile picture`}
                            width={28}
                            height={28}
                          />
                          <p>{master.name}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {master.email}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {master.total_invoices}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {master.total_pending}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm ">
                        {master.total_paid}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm ">
                        {master.total_workload}/{master.workload}
                      </td>
                      <td className="whitespace-nowrap bg-white py-3 pl-6 pr-3 group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        <div className="flex justify-end gap-3">
                          <UpdateMaster id={master.id} />
                          <DeleteMaster id={master.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
