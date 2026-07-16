import pandas as pd
import json
import os

def clean_headers(df):
    """Remove newlines and extra spaces from headers."""
    df.columns = [str(col).replace('\n', '').replace('\r', '').strip() for col in df.columns]
    # Reduce multiple spaces to single space
    df.columns = [' '.join(col.split()) for col in df.columns]
    return df

def fetch_and_clean_csv(url, skiprows=1):
    print(f"Fetching: {url}")
    try:
        df = pd.read_csv(url, skiprows=skiprows)
        df = clean_headers(df)
        df = df.fillna('')
        return df.to_dict('records')
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
        return []

def main():
    SIR_URL = "https://docs.google.com/spreadsheets/d/1RB8UrAh1kzGJOAG-ayU-6NrfgQJPSLupFp6owpzzQmA/export?format=csv&gid=0"
    
    print("Downloading SIR data...")
    data = fetch_and_clean_csv(SIR_URL, skiprows=1)
    
    # Save to public/data directory
    os.makedirs('public/data', exist_ok=True)
    out_path = 'public/data/sir_data.json'
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
        
    print(f"Successfully saved SIR data to {out_path}")

if __name__ == "__main__":
    main()
