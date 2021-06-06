from django.shortcuts import render
from django.http import HttpResponse
from .models import FrolexEntry
from .forms import VariantForm
from django.forms import formset_factory
VariantFormSet = formset_factory(VariantForm)

# Create your views here.

def search_view(request):
    query = request.GET.get('q')
    show_search = False

    if query:
        show_search = True
        results = FrolexEntry.objects.filter(lemma=query)
    else:
        results = None
    context = {
        'results':results, 
        'show_search':show_search,
        'query':query,
        }
    return render(request, 'search.html', context)

def about_view(request):
    return render(request, 'about.html', {})

def howto_view(request):
    return render(request, 'howto.html', {})

