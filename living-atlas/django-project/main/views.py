from django.shortcuts import render
from django.http import HttpResponse
from .models import FrolexEntry

# Create your views here.

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

    query = request.GET.get('q')

    # This is the logic used for getting the selected checkboxes
    # We loop over all the separate checkbox names and make them into a list
    input_keys = [key for key in request.POST if key.startswith("ckbox")]
    selected_checkboxes = []
    for key in input_keys:
        selected_checkboxes.extend(request.POST.getlist(key))

    if query:
        querylist = [query.strip() for query in query.split(',')]
        search_results = True
        results = []
        for lemma in querylist:
            results.extend(FrolexEntry.objects.filter(lemma = lemma))

        found_lemmas = set([result.lemma for result in results if result.lemma == result.form])
        # Note: NOT a django form -- linguistic "form"
        found_forms = set([result for result in results if result.lemma != result.form])
    else:
        results = None
        search_results = False
        querylist = None
        found_lemmas = None
        found_forms = None

    context = {
        'results':results, 
        'search_results':search_results,
        'query':query,
        'querylist':querylist,
        'selected_checkboxes':selected_checkboxes,
        'found_lemmas':found_lemmas,
        'found_forms':found_forms,
        }

    return render(request, 'search.html', context)

def about_view(request):
    return render(request, 'about.html', {})

def howto_view(request):
    return render(request, 'howto.html', {})

