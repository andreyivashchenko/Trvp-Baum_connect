import { lusitana } from '@/app/ui/fonts';

export default function AcmeLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row content-between leading-none text-white`}
    >
      <p className="pl-5 text-[40px]">Baum connect</p>
    </div>
  );
}
