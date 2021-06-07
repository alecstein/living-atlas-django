from django.shortcuts import render
from django.http import HttpResponse
from .models import FrolexEntry
from django.db.models import Q
Q(question__startswith='What')

# from .forms import VariantForm
# from django.forms import formset_factory
# VariantFormSet = formset_factory(VariantForm)

# Create your views here.

def search_view(request):
    query = request.GET.get('q')
    if query is not None:
        querylist = [query.strip() for query in query.split(',')]
        for lemma in querylist:
            print(lemma)
    else:
        querylist = None
    show_search = False

    if query:
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
        }
    return render(request, 'search.html', context)

def about_view(request):
    return render(request, 'about.html', {})

def howto_view(request):
    return render(request, 'howto.html', {})

