from django import forms

# class ChoiceSelectForm(forms.Form):
#     def __init__(self, *args, **kwargs):
#         queryset = kwargs.pop('queryset', False)
#         self.choices = forms.MultipleChoiceField(
#             widget=forms.CheckboxSelectMultiple,
#             queryset=queryset,
#         )

class FrolexEntryForm(forms.ModelForm):
    class Meta:
        model = FrolexEntry
        fields = ['form', 'lemma']