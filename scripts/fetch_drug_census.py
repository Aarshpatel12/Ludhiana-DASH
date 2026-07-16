import pandas as pd
import json
import os

SHEET_ID = '1I7Bc_ryaUeUzxdTPBSR0UHZI8IeVHIB4T4IdqL5BFYU'
BASE_URL = f'https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid='

GIDS = {
    'tracker': '828768116',
    'daily_surveys': '2140558419',
    'progress': '1375071192',
    'deployment_gaps': '527968883',
    'booth_analysis': '1554199060'
}

def clean_column_names(columns):
    return [str(c).replace('\n', ' ').replace('\r', '').strip() for c in columns]

def fetch_sheet(gid, skip_rows=3):
    url = f"{BASE_URL}{gid}"
    try:
        # We skip the first 3 rows to get to the actual headers on row 4
        df = pd.read_csv(url, skiprows=skip_rows)
        # Drop columns that are completely unnamed or empty
        df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
        df.columns = clean_column_names(df.columns)
        
        # Drop rows where all elements are NaN
        df.dropna(how='all', inplace=True)
        # Convert to dictionary records
        return df.to_dict('records')
    except Exception as e:
        print(f"Error fetching gid {gid}: {e}")
        return []

def main():
    print("Fetching Drug Census Data...")
    
    data = {
        'tracker': fetch_sheet(GIDS['tracker']),
        'daily_surveys': fetch_sheet(GIDS['daily_surveys']),
        'progress': fetch_sheet(GIDS['progress']),
        'deployment_gaps': fetch_sheet(GIDS['deployment_gaps']),
        'booth_analysis': fetch_sheet(GIDS['booth_analysis'])
    }
    
    # Save to public/data
    out_dir = os.path.join('public', 'data')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'drug_census.json')
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"Data successfully saved to {out_path}")

if __name__ == '__main__':
    main()
