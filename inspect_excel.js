const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('Master_Priority_Agenda_Review.xlsx');

let output = '# Excel File Review\n\n';

workbook.SheetNames.forEach(sheetName => {
  output += `## Sheet: ${sheetName}\n`;
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  if (json.length === 0) {
    output += 'Empty sheet.\n\n';
    return;
  }
  
  // Try to find the header row.
  let headerRow = null;
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(15, json.length); i++) {
    const row = json[i];
    if (row && (row.includes('Officer / Tab') || row.includes('Priority Agenda') || row.includes('Sr') || row.includes('Sr.'))) {
      headerRow = row;
      headerRowIndex = i;
      break;
    }
  }

  if (headerRow) {
    output += `**Headers:** \`${JSON.stringify(headerRow.filter(Boolean))}\`\n\n`;
    output += `**Sample Row:** \`${JSON.stringify(json[headerRowIndex + 1])}\`\n\n`;
  } else {
    output += `Could not automatically detect headers. First 3 rows:\n`;
    for(let i = 0; i < Math.min(3, json.length); i++) {
       output += `- \`${JSON.stringify(json[i])}\`\n`;
    }
    output += '\n';
  }
});

fs.writeFileSync('excel_review.md', output);
console.log('excel_review.md generated.');
