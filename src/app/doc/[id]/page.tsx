import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import Link from 'next/link';

export default async function DocPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Resolve the filename based on the id
  let filename = '';
  if (id.toLowerCase() === 'instructions') {
    filename = 'Instructions.csv';
  } else if (id.toLowerCase() === 'dataconnections') {
    filename = '🔗_Data_Connections.csv';
  } else {
    filename = `${id}.csv`;
  }

  const filePath = path.join(process.cwd(), 'data', 'csv', filename);
  
  let rows: string[][] = [];
  try {
    const fileContents = await fs.promises.readFile(filePath, 'utf8');
    const parsed = Papa.parse(fileContents, { header: false, skipEmptyLines: true });
    rows = parsed.data as string[][];
  } catch (error) {
    return (
      <div className="p-8 text-center text-slate-500">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Documentation Not Found</h1>
        <p>Could not load {id}.</p>
      </div>
    );
  }

  const title = id === 'DataConnections' ? 'Data Connections' : 'Instructions';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 transition-colors">
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Overview</Link>
          <span>/</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{title}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Raw documentation from the master Excel sheet.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 transition-colors">
        <div className="space-y-6">
          {rows.map((row, idx) => {
            // Remove empty columns for clean reading
            const cleanRow = row.filter(cell => cell.trim() !== '');
            if (cleanRow.length === 0) return null;
            
            // If it's a header-like row (all caps or only 1 column)
            if (cleanRow.length === 1) {
              return (
                <h3 key={idx} className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 mt-6 first:mt-0">
                  {cleanRow[0]}
                </h3>
              );
            }
            
            // Render as Key-Value or List
            return (
              <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm">
                <div className="sm:w-1/4 font-semibold text-slate-700 dark:text-slate-300">
                  {cleanRow[0]}
                </div>
                <div className="sm:w-3/4 text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {cleanRow.slice(1).join(' | ')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
