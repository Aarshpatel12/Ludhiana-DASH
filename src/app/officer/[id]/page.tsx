import { fetchOfficerData } from '@/lib/dataFetcher';
import Link from 'next/link';
import OfficerCharts from '@/components/OfficerCharts';
import OfficerAgendas from '@/components/OfficerAgendas';

export default async function OfficerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  
  let data = [];
  try {
    data = await fetchOfficerData(decodedId);
  } catch (error) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Error loading officer data</h1>
        <p>Could not fetch or parse data for {decodedId}. Please check if the officer name matches the sheet.</p>
        <Link href="/" className="text-blue-500 mt-4 inline-block hover:underline">← Back to Overview</Link>
      </div>
    );
  }

  // We no longer pre-split the data here, OfficerAgendas handles grouping everything!
  const isScheme = (row: any) => row['Target / Total'] || (row['Achieved %'] && row['Achieved %'].trim() !== '-');
  const schemes = data.filter(isScheme);
  const tasks = data.filter((row) => !isScheme(row));

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 transition-colors">
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Overview</Link>
          <span>/</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{decodedId}</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{decodedId} Review</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Tracking {data.length} total items ({schemes.length} schemes and {tasks.length} priority tasks).
        </p>
      </div>

      <OfficerCharts schemes={schemes} tasks={tasks} />

      <OfficerAgendas data={data} />
    </div>
  );
}
