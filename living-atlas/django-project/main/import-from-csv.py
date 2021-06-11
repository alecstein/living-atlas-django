from main.models import Lemma
import csv
from tqdm import tqdm
with open('../../medieval-french-lang-toolkit/frolex-lemmas.csv') as f:
    reader = csv.reader(f)
    for row in tqdm(reader):
        print(row)
        break
        _, created = Lemma.objects.get_or_create(
            first_name=row[0],
            last_name=row[1],
            middle_name=row[2],
            )
        # creates a tuple of the new object or
        # current object and a boolean of if it was created

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
