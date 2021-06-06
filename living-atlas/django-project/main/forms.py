from django import forms

class VariantForm(forms.Form):
    selected_variant = forms.CheckboxInput()