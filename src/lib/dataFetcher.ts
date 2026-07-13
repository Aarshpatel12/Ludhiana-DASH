import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

export const SHEET_ID = '1bqL7ao3w5-RB7AuWS2MCKwgvNFbacmD6mnmozOj0sCs';

export const SHEET_GIDS = {
  'Master Dashboard': '687405176',
  'AC (G)': '1100161942',
  'ADC (G)': '1537626482',
  'ADC (J)': '1444373631',
  'ADC (K)': '421303127',
  'ADC (RD)': '719474460',
  'ADC (UD)': '64190071',
  'CMFO': '569549252',
  'DRO': '1985985371',
  'RTA': '917800457',
  'SDM East': '990808946',
  'SDM Jagraon': '484451615',
  'SDM Payal': '1975734938',
  'SDM Raikot': '1672166396',
  'SDM Samrala': '1037531598',
  'SDM West': '1756004693',
};

export interface MasterRow {
  'Officer / Tab': string;
  'Total KPIs': string;
  'Completed': string;
  'On Track': string;
  'In Progress': string;
  'Pending/Blocked': string;
  'Not Started': string;
  '% Done': string;
  'Flags': string;
  [key: string]: string;
}

export interface MasterMetadata {
  title: string;
  subtitle: string;
  thresholdInfo: string;
  instructions?: string[];
}

export interface OfficerRow {
  'Sr': string;
  'Priority Agenda': string;
  'KPI / Metric': string;
  'Concerned Officer': string;
  'Target / Total': string;
  'Flag Bar': string;
  'Last Value': string;
  'Current Value': string;
  'Change': string;
  'Achieved %': string;
  'Status': string;
  'Auto-Flag': string;
  'Bottom Performer': string;
  'Updated By': string;
  'Update Date': string;
  'Remarks / Context': string;
  'Rule': string;
  'Key': string;
  [key: string]: string;
}

const fetchCsv = async (sheetName: string): Promise<string> => {
  const safeName = sheetName.replace(/ /g, '_').replace(/\//g, '_');
  const filePath = path.join(process.cwd(), 'data', 'csv', `${safeName}.csv`);
  
  try {
    const fileContents = await fs.promises.readFile(filePath, 'utf8');
    return fileContents;
  } catch (error) {
    throw new Error(`Failed to read local CSV for ${sheetName} at ${filePath}: ${error}`);
  }
};

const normalizeKey = (key: string) => {
  const lower = key.toLowerCase();
  if (lower.includes('officer / tab')) return 'Officer / Tab';
  if (lower.includes('total kpis')) return 'Total KPIs';
  if (lower.includes('completed')) return 'Completed';
  if (lower.includes('on track')) return 'On Track';
  if (lower.includes('in progress')) return 'In Progress';
  if (lower.includes('pending/blocked') || lower.includes('pending / blocked')) return 'Pending/Blocked';
  if (lower.includes('not started')) return 'Not Started';
  if (lower.includes('% done')) return '% Done';
  if (lower.includes('flags')) return 'Flags';

  if (lower === 'sr' || lower === 'sr.') return 'Sr';
  if (lower.includes('priority agenda')) return 'Priority Agenda';
  if (lower.includes('kpi / metric')) return 'KPI / Metric';
  if (lower.includes('concerned officer')) return 'Concerned Officer';
  if (lower.includes('target / total')) return 'Target / Total';
  if (lower.includes('flag bar')) return 'Flag Bar';
  if (lower.includes('last value')) return 'Last Value';
  if (lower.includes('current value')) return 'Current Value';
  if (lower.includes('change')) return 'Change';
  if (lower.includes('achieved %')) return 'Achieved %';
  if (lower.includes('status')) return 'Status';
  if (lower.includes('auto-flag')) return 'Auto-Flag';
  if (lower.includes('bottom performer')) return 'Bottom Performer';
  if (lower.includes('updated by')) return 'Updated By';
  if (lower.includes('update date')) return 'Update Date';
  if (lower.includes('remarks / context')) return 'Remarks / Context';
  if (lower === 'rule') return 'Rule';
  if (lower === 'key') return 'Key';
  
  return key.trim().replace(/\r?\n|\r/g, ' ');
};

export const fetchMasterDashboard = async (): Promise<{ data: MasterRow[], metadata: MasterMetadata }> => {
  const csvText = await fetchCsv('Master Dashboard');
  
  const parsed = Papa.parse(csvText, { header: false, skipEmptyLines: true });
  const rows = parsed.data as string[][];
  
  const metadata: MasterMetadata = {
    title: (rows[0]?.[1] || '').trim(),
    subtitle: (rows[1]?.[1] || '').trim(),
    thresholdInfo: (rows[2]?.[1] || '').trim() + ' ' + (rows[3]?.[1] || '').trim() + ' ' + (rows[3]?.[2] || '').trim()
  };
  
  let headerIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].includes('Officer / Tab') || rows[i].includes('Total KPIs')) {
      headerIndex = i;
      break;
    }
  }
  
  if (headerIndex === -1) {
    throw new Error('Could not find header row in Master Dashboard CSV');
  }
  
  const headers = rows[headerIndex];
  const dataRows = rows.slice(headerIndex + 1);
  
  const data: MasterRow[] = dataRows.map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      if (header) {
        const cleanHeader = normalizeKey(header);
        obj[cleanHeader] = row[index]?.trim() || '';
      }
    });
    return obj as MasterRow;
  });
  
  const officers = data.filter(d => d['#'] && d['#'].trim() !== '');
  
  const instructions = dataRows
    .map(row => row[1]?.trim())
    .filter(text => text && (text === 'WEEKLY MEETING FOCUS' || text.startsWith('•')));

  return {
    data: officers,
    metadata: {
      ...metadata,
      instructions
    }
  };
};

export const fetchOfficerData = async (officerName: string): Promise<OfficerRow[]> => {
  const normalizedName = Object.keys(SHEET_GIDS).find(
    k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === officerName.toLowerCase().replace(/[^a-z0-9]/g, '')
  );
  
  if (!normalizedName) {
    throw new Error(`Officer ${officerName} not found`);
  }
  
  const csvText = await fetchCsv(normalizedName);
  
  const parsed = Papa.parse(csvText, { header: false, skipEmptyLines: true });
  const rows = parsed.data as string[][];
  
  let headerIndex = -1;
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    if (rows[i].includes('Priority Agenda') || rows[i].includes('KPI / Metric') || rows[i].includes('Sr') || rows[i].includes('Sr.')) {
      headerIndex = i;
      break;
    }
  }
  
  if (headerIndex === -1) {
    throw new Error(`Could not find header row in CSV for ${officerName}`);
  }
  
  const headers = rows[headerIndex];
  const dataRows = rows.slice(headerIndex + 1);
  
  let lastPriorityAgenda = '';
  const data: OfficerRow[] = dataRows.map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      if (header) {
        const cleanHeader = normalizeKey(header);
        obj[cleanHeader] = row[index]?.trim() || '';
      }
    });
    
    // Excel logic: inherit merged Priority Agenda
    if (obj['Priority Agenda']) {
      lastPriorityAgenda = obj['Priority Agenda'];
    } else {
      obj['Priority Agenda'] = lastPriorityAgenda;
    }
    
    return obj as OfficerRow;
  });
  
  return data.filter(d => d['Priority Agenda'] || d['KPI / Metric']);
};
