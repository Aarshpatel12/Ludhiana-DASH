import csv
import os
import glob

csv_files = glob.glob('data/csv/*.csv')
headers_set = set()

for file in csv_files:
    with open(file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)
        for row in rows[:15]:
            # Guess header row if it contains 'Sr' or 'Officer / Tab'
            if 'Sr' in row or 'Sr.' in row or 'Officer / Tab' in row or 'Priority Agenda' in row:
                for h in row:
                    if h.strip():
                        headers_set.add(h.strip().replace('\n', ' '))
                break

print("All found headers:")
for h in sorted(headers_set):
    print(f"- {h}")
