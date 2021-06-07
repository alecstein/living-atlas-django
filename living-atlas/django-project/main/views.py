from django.shortcuts import render
from django.http import HttpResponse
from .models import FrolexEntry
# from .forms import ChoiceSelectForm

# from .forms import VariantForm
# from django.forms import formset_factory
# VariantFormSet = formset_factory(VariantForm)

# Create your views here.

def search_view(request):

    show_search = False
    querylist = None
    query = request.GET.get('q')

    # This is the logic used for getting the selected checkboxes
    # We loop over all the separate checkbox names and make them into a list
    input_keys = [key for key in request.POST if key.startswith("ckbox")]
    selected_checkboxes = []
    for key in input_keys:
        selected_checkboxes.extend(request.POST.getlist(key))

    if query:
        querylist = [query.strip() for query in query.split(',')]
        show_search = True
        results = []
        for lemma in querylist:
            results.extend(FrolexEntry.objects.filter(lemma = lemma))
    else:
        results = None
    context = {
        'results':results, 
        'show_search':show_search,
        'query':query,
        'querylist':querylist,
        'selected_checkboxes':selected_checkboxes,
        }

    return render(request, 'search.html', context)

def about_view(request):
    return render(request, 'about.html', {})

def howto_view(request):
    return render(request, 'howto.html', {})

