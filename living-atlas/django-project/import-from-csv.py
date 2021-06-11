import csv
from tqdm import tqdm
from main.models import Lemma, Form

# with open('../medieval-french-lang-toolkit/frolex-lemmas.csv') as f:
#     reader = csv.reader(f)
#     next(reader)
#     for idx, row in tqdm(enumerate(reader)):
#         lemma_entry = Lemma(lemma = row[0])
#         lemma_entry.save()

with open('../medieval-french-lang-toolkit/frolex-forms.csv') as f:
    reader = csv.reader(f)
    print(next(reader))
    for idx, row in tqdm(enumerate(reader)):
        entry = Form(form = row[0], lemma=row[1])
        entry.save()

# # %%
# import os
# import csv
# # %%
# path = '/Users/dirac/AlecTecLLC/dees-living-atlas/medieval-french-lang-toolkit'
# os.chdir(path)
# from search.models import FrolexEntry
# with open('frolex-3.0.tsv') as f:
#     reader = csv.DictReader(f, delimiter = "\t")
#     for i, row in enumerate(reader):
#         if i % 1000 == 0:
#             print(i)
#         elif i > 5000:
#             break
#         p = FrolexEntry(
#             form = row['form'],
#             F_bfm = row['F_bfm'],
#             F_dmf = row['F_dmf'],
#             msd_afrlex = row['msd_afrlex'],
#             msd_bfm = row['msd_bfm'],
#             msd_cattex_conv1 = row['msd_cattex_conv1'],
#             msd_cattex_conv2 = row['msd_cattex_conv2'],
#             lemma = row['lemma'],
#             lemma_src = row['lemma_src'],
#         )
#         p.save()
# %%

# %%
# import pandas as pd
# # %%
# import sqlite3 as lite
# import sys
 
# con = lite.connect('db.sqlite3')
# df = pd.read_sql('select * from sqlite_master', con)

# %%
