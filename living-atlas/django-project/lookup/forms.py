from django import forms

class HyperBaseQueryForm(forms.Form):
    corpus_id = forms.CharField(help_text = 'String of letters and numbers, no spaces', initial = 'elysee')
    corpus = forms.CharField(help_text = '[PARTITION_ID]: [PARTITION_ID | all]', initial = 'president:all')
    query = forms.CharField(help_text = 'String of letters', initial = 'France')