import csv
from tqdm import tqdm
from main.models import Form

# Run with
# ./manage.py shell < import-from-csv.py

with open('../medieval-french-lang-toolkit/frolex-latin.csv') as f:
    reader = csv.reader(f)
    print(next(reader))
    for idx, row in tqdm(enumerate(reader)):
        # entry = Form(form = row[0], lemma=row[1])
        entry = Form(lemma = row[0], latin=row[1], form=row[2])
        entry.save()