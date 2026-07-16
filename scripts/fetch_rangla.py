import pandas as pd
import json

base_url = "https://docs.google.com/spreadsheets/d/1BQKR9bPEhn_CQJyGeLOKIWtqhKzP9c-gdztmvF2Huaw/export?format=csv&gid="
gids = {
    "Phase I": "243257922",
    "Phase II": "486445762",
    "Phase III": "1345749458"
}

data = {}

# Parse Phase I & II
for phase in ["Phase I", "Phase II"]:
    df = pd.read_csv(base_url + gids[phase], skiprows=4)
    
    if phase == "Phase I":
        df.columns = ["Sr_No", "Agency", "Total", "InProgress", "Completed", "NotStarted", "CompletionPct", "Change", "PendingPct", "Status"]
    else:
        df.columns = ["Sr_No", "Agency", "Total", "InProgress", "Completed", "NotStarted", "CompletionPct", "PendingPct", "Status"]
        
    rows = []
    for _, row in df.iterrows():
        agency = str(row['Agency']).strip()
        if agency.lower() in ['nan', 'none', ''] or 'TOTAL' in agency.upper() or 'RURAL' == agency.upper() or 'URBAN' in agency.upper():
            continue
            
        try:
            total = int(row['Total'])
            in_prog = int(row['InProgress'])
            comp = int(row['Completed'])
            not_start = int(row['NotStarted'])
            
            rows.append({
                "Agency": agency,
                "Total": total,
                "InProgress": in_prog,
                "Completed": comp,
                "NotStarted": not_start,
                "Status": str(row['Status']).strip() if str(row['Status']).strip() != 'nan' else ''
            })
        except Exception as e:
            continue
            
    data[phase] = rows

# Parse Phase III
df3 = pd.read_csv(base_url + gids["Phase III"], skiprows=4)
# Drop the last empty columns if they exist
df3 = df3.iloc[:, :7]
df3.columns = ["Sr_No", "District", "Constituency", "Proposal_MLA", "Approved_DLC", "Summary", "Count"]

p3_rows = []
for _, row in df3.iterrows():
    const = str(row['Constituency']).strip()
    if const.lower() in ['nan', 'none', '']:
        continue
    
    p3_rows.append({
        "Constituency": const,
        "Proposal_MLA": str(row['Proposal_MLA']),
        "Approved_DLC": str(row['Approved_DLC'])
    })
    
data["Phase III"] = p3_rows

with open('public/data/rangla_punjab.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Saved to public/data/rangla_punjab.json")
