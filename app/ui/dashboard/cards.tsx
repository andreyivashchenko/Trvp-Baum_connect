import {
  BanknotesIcon,
  ClockIcon,
  InboxIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchCardData } from '@/app/lib/data';

const iconMap = {
  collected: BanknotesIcon,
  masters: UserGroupIcon,
  pending: ClockIcon,
  applications: InboxIcon,
};

export default async function CardWrapper() {
  const {
    numberOfMasters,
    numberOfApplications,
    totalPaidApplications,
    totalPendingApplications,
  } = await fetchCardData();
  return (
    <>
      <Card title="Collected" value={totalPaidApplications} type="collected" />
      <Card title="Pending" value={totalPendingApplications} type="pending" />
      <Card
        title="Total Applications"
        value={numberOfApplications}
        type="applications"
      />
      <Card title="Total Masters" value={numberOfMasters} type="masters" />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'applications' | 'masters' | 'pending' | 'collected';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}
