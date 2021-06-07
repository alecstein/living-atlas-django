from django import forms

class FrolexEntryForm(forms.ModelForm):
    class Meta:
        model = FrolexEntry
        fields = ['form', 'lemma']