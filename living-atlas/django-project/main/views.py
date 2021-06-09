from django.shortcuts import render
from django.http import HttpResponse
from .models import FrolexEntry
import json

# Create your views here.

# %%

# %%
def search_view(request):
    """
    The app revolves around this view, which is also the homepage.
    show_search: bool. whether or not to show the search results
    querylist: list of strings that are queried
    query: whatever someone types in the searchbox
    input_keys: list of keys that I use to get the checkboxes that have been selected
    selected_checkboxes: what it sounds like
    
    The filter selects all database objects with their lemma equal to
    the lemma(s) selected by the user
    """

    context = {}

    if request.method == 'GET':
        # Check to see if a non-regex query was submitted
        if request.GET.get('q'):
            query = request.GET.get('q')
            # Only accept lemmas which are not the empty string ''
            lemmas = set([lemma for lemma in query.strip().splitlines() if lemma.strip()])
            if len(lemmas) == 0:
                # If no valid lemmas are found, return invalid search page
                context['valid_search'] = False
                return render(request, 'search.html', context)

            # Get all matching forms and lemmas
            context['valid_search'] = True
            results = FrolexEntry.objects.filter(lemma__in = lemmas)

            # Build a dictionary of the forms and lemmas
            # Lemmas are keys, a list of forms is the value
            result_dict = {}
            for result in results:
                if result.form != result.lemma:
                    # Only include forms
                    try:
                        result_dict[result.lemma].append(result.form)
                    except KeyError:
                        result_dict[result.lemma] = [result.form]
            context['result_dict'] = result_dict
            return render(request, 'search.html', context)

        if request.GET.get('r'):
            # Check to see if a regex query was submitted
            query = request.GET.get('r')
            if query == '':
                context['valid_search'] == False
                return render(request, 'search.html', context)

            # Get all matching forms and lemmas
            context['valid_search'] = True
            results = FrolexEntry.objects.filter(lemma__regex=fr"{query}")

            # Build a dictionary of the forms and lemmas
            # Lemmas are keys, a list of forms is the value
            result_dict = {}
            for result in results:
                if result.form != result.lemma:
                    # Only include forms
                    try:
                        result_dict[result.lemma].append(result.form)
                    except KeyError:
                        result_dict[result.lemma] = [result.form]
            context['result_dict'] = result_dict
            print(result_dict)
            return render(request, 'search.html', context)


    if request.method == 'POST':
        # Form was submitted
        keys = [key for key in request.POST if key.startswith('checkbox')]
        selections = []
        for key in keys:
            selections.extend(request.POST.getlist(key))

        if len(selections) == 0:
            context['valid_submission'] = False
            return render(request, 'search.html', context)

        context['valid_submission'] = True
        context['selections'] = selections

        return render(request, 'search.html', context)

    return render(request, 'search.html', context)
 
def about_view(request):
    return render(request, 'about.html', {})

def howto_view(request):
    return render(request, 'howto.html', {})

