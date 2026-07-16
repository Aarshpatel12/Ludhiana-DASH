import os
import json
import pdfplumber

def clean_value(v):
    if v is None:
        return ""
    v = str(v).replace('\n', ' ').strip()
    return v

def process_pdfs():
    base_dir = 'Drug'
    output_data = {
        "assembly_summary": [],
        "booths": []
    }
    
    if not os.path.exists(base_dir):
        print(f"Directory {base_dir} not found")
        return

    # Process 16-07-2026.pdf for summary
    summary_pdf = os.path.join(base_dir, '16-07-2026.pdf')
    if os.path.exists(summary_pdf):
        with pdfplumber.open(summary_pdf) as pdf:
            # We assume table is on the first page
            page = pdf.pages[0]
            table = page.extract_table()
            
            if table:
                # Find the header row by looking for 'Assembly'
                header_idx = -1
                for i, row in enumerate(table):
                    if row and any(cell and 'Assembly' in str(cell) for cell in row):
                        header_idx = i
                        break
                
                if header_idx != -1:
                    headers = [clean_value(c) for c in table[header_idx]]
                    # It's a complex multi-level header in the PDF.
                    # We know the columns based on manual inspection:
                    # Sr.no, Assembly, Supervisor (Total, Assigned, 15 July, Diff, Pend, %), Enumerator (Total, Assigned, 15 July, Diff, Pend, %), 
                    # Survey Details (Target, Completed, 15 July, Diff, Pend, %), QC Progress (Target, Completed, 15 July, Diff, Pend, %)
                    # The OCR showed 26 columns total.
                    # Let's just grab rows that start with a number.
                    for row in table[header_idx+1:]:
                        if not row or not row[0]: continue
                        try:
                            sr_no = int(clean_value(row[0]))
                            
                            # Based on column indices from OCR
                            assembly = clean_value(row[1])
                            target = int(clean_value(row[14]).replace(',', '')) # column O: Target
                            completed = int(clean_value(row[15]).replace(',', '')) # column P: Completed
                            pending = int(clean_value(row[18]).replace(',', '')) # column S: Pending
                            percentage = float(clean_value(row[19])) # column T: %
                            
                            qc_target = int(clean_value(row[20]).replace(',', '')) # column U: Target
                            qc_completed = int(clean_value(row[21]).replace(',', '')) # column V: Completed
                            qc_pending = int(clean_value(row[24]).replace(',', '')) # column Y: Pending
                            qc_percentage = float(clean_value(row[25])) # column Z: %
                            
                            output_data["assembly_summary"].append({
                                "assembly": assembly,
                                "target": target,
                                "completed": completed,
                                "pending": pending,
                                "percentage": percentage,
                                "qc_target": qc_target,
                                "qc_completed": qc_completed,
                                "qc_pending": qc_pending,
                                "qc_percentage": qc_percentage
                            })
                        except Exception as e:
                            pass
                            
    # Process other PDFs for booth data
    for filename in os.listdir(base_dir):
        if filename.endswith('.pdf') and filename != '16-07-2026.pdf':
            file_path = os.path.join(base_dir, filename)
            assembly_name = filename.replace('.pdf', '')
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    table = page.extract_table()
                    if not table: continue
                    
                    # Columns: S.No., Booth ID, Booth Name, Assembly, Booth Target, Total Survey Completed, Pending Survey, Percentage, Surveyor Name, Surveyor Mobile, Is Login
                    header_idx = -1
                    for i, row in enumerate(table):
                        if row and any(cell and 'Booth ID' in str(cell) for cell in row):
                            header_idx = i
                            break
                            
                    if header_idx != -1:
                        for row in table[header_idx+1:]:
                            if not row or not row[0]: continue
                            try:
                                # Sometimes the page continues the table without a proper header if we use extract_table. 
                                # But let's just parse rows starting with a number.
                                sr_no = int(clean_value(row[0]))
                                output_data["booths"].append({
                                    "booth_id": clean_value(row[1]),
                                    "booth_name": clean_value(row[2]),
                                    "assembly": clean_value(row[3]),
                                    "target": int(clean_value(row[4])) if clean_value(row[4]) else 0,
                                    "completed": int(clean_value(row[5])) if clean_value(row[5]) else 0,
                                    "pending": int(clean_value(row[6])) if clean_value(row[6]) else 0,
                                    "percentage": float(clean_value(row[7])) if clean_value(row[7]) else 0.0,
                                    "surveyor": clean_value(row[8]),
                                    "mobile": clean_value(row[9]),
                                    "is_login": clean_value(row[10])
                                })
                            except Exception as e:
                                pass # Skip header/footer rows

    os.makedirs('public/data', exist_ok=True)
    with open('public/data/drug_census.json', 'w') as f:
        json.dump(output_data, f, indent=2)
    print("Successfully processed PDFs and generated public/data/drug_census.json")

if __name__ == "__main__":
    process_pdfs()
