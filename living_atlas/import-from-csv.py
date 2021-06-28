import csv
from tqdm import tqdm
from django.core.exceptions import ObjectDoesNotExist
from search.models import Form, Lemma

batch_size = 1000

with open('../source/lemmas.csv') as file:
    reader = csv.DictReader(file)

    lemmas = []
    for row in tqdm(reader):
        if row['homonym_id']:
            lemma = Lemma(lemma = row['lemma'], 
                      latin = row['latin'], 
                      homonym_id = row['homonym_id'])
            lemmas.append(lemma)
        else:
            lemma = Lemma(lemma = row['lemma'], 
                      latin = row['latin'])
            lemmas.append(lemma)

    Lemma.objects.bulk_create(lemmas)

with open('../source/forms.csv') as file:
    reader = csv.DictReader(file)

    forms = []

    for idx, row in tqdm(enumerate(reader)):

        if row['homonym_id']:
            lemma = Lemma.objects.get(lemma = row['lemma'], 
                                    homonym_id = row['homonym_id'],
                                    latin = row['latin'])
        else:
            lemma = Lemma.objects.get(lemma = row['lemma'], 
                                    homonym_id__isnull = True,
                                    latin = row['latin'])


        form = Form(form = row['form'], lemma = lemma)
        forms.append(form)
        if idx % batch_size == 0:
            Form.objects.bulk_create(forms)
            forms = []

    Form.objects.bulk_create(forms)