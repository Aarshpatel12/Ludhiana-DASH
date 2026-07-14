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

  // Generate automated insights
  const totalItems = data.length;
  const flaggedItems = data.filter(r => r['Auto-Flag']?.trim() !== '').length;
  const completedItems = data.filter(r => r['Status']?.toLowerCase() === 'completed').length;
  const pendingItems = totalItems - flaggedItems - completedItems;

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

        {/* AI Insights Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl p-4 mt-6 flex gap-4 items-start shadow-sm print:hidden">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
          </div>
          <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-0.5">
            <strong>Automated Summary:</strong> This dashboard is currently tracking <strong>{totalItems}</strong> items for {decodedId}. 
            {flaggedItems > 0 ? (
              <> There are <strong className="text-red-600 dark:text-red-400">{flaggedItems} flagged items</strong> requiring immediate attention, </>
            ) : (
              <> There are currently <strong>0 flagged items</strong>, </>
            )}
            and <strong className="text-emerald-600 dark:text-emerald-400">{completedItems} items</strong> have been successfully completed. 
            The remaining {pendingItems} items are in progress.
          </div>
        </div>
      </div>

      <OfficerCharts schemes={schemes} tasks={tasks} />

      <OfficerAgendas data={data} />
    </div>
  );
}
