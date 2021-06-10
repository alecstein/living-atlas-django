from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect
from .models import Form
import json
from time import time
# Create your views here.


def search_view(request):
    """
    The app revolves around this view, which is also the homepage.
    """

    context = {}

    print(request.GET)

    if request.method == 'GET':
        # Searchbox submission

        if request.GET.get('lang') == 'french':
            queryset = Form.objects.all()

        elif request.GET.get('lang') == 'latin':
            queryset = Form.objects.all()

        if request.GET.get('clear'):
            # Return a blank page
            request.session.flush()
            return render(request, 'search.html', context)

        if request.GET.get('type') == 'list':
            # Normal query type
            query = request.GET.get('q')
            # Only accept lemmas which are not the empty string ''
            lemmas = set([lemma for lemma in query.strip().splitlines() if lemma.strip()])
            if len(lemmas) == 0:
                # If no valid queries are found, return same page
                return render(request, 'search.html', context)

            # Save the valid query
            request.session['query'] = query
            # Get all matching forms and lemmas
            forms = queryset.filter(lemma__in = lemmas)
            if len(forms) == 0:
                context['no_results'] = True
                return render(request, 'search.html', context)

        elif request.GET.get('type') == 'regex':
            # Regex query type
            query = request.GET.get('q')
            request.session['query'] = query
            if query == '':
                context['valid_search'] == False
            else:
                # Get all matching forms and lemmas
                context['valid_search'] = True
                forms = queryset.filter(lemma__regex =fr"{query}")[:2000]
        else:
            return render(request, 'search.html', context)

        form_dict = {}
        for form in forms:
            if form.form != form.lemma:
                # Only include forms
                try:
                    form_dict[form.lemma].append(form.form)
                except KeyError:
                    form_dict[form.lemma] = [form.form]

        if request.GET.get('query_A'):
            request.session['query_A'] = form_dict

        elif request.GET.get('query_B'):
            request.session['query_B'] = form_dict

        else: HttpResponse("Broken pipe")

        return render(request, 'search.html', context)

    if request.method == 'POST':
        if not request.session.get('query_A', False):
            context['invalid_submission'] = True
            return render(request, 'search.html', context) 

        if not request.session.get('query_B', False):
            context['invalid_submission'] = True
            return render(request, 'search.html', context)

        selections_dict_A = {}
        selections_dict_B = {}

        lemma_selections_A = []
        lemma_selections_B = []

        print(request.POST)

        for key in request.POST:
            if key.startswith('checkbox'):
                if 'child' not in key:
                    if key[-1] == 'A':
                        lemma_name = key.split('-')[1].strip('A')
                        lemma_selections_A.append((key, lemma_name))                        
                        print(lemma_name, key[-1])

                    elif key[-1] == 'B':
                        lemma_name = key.split('-')[1].strip('B')
                        lemma_selections_B.append((key, lemma_name))   
                        print(lemma_name, key[-1])

        for key, lemma_name in lemma_selections_A:
            key = key + "-child"
            selections_dict_A[lemma_name] = request.POST.getlist(key)

        for key, lemma_name in lemma_selections_B:
            key = key + "-child"
            selections_dict_B[lemma_name] = request.POST.getlist(key)


        data = {}
        data['query_A'] = selections_dict_A
        data['query_B'] = selections_dict_B
        request.session.flush()
        return JsonResponse(data,status=200)
 
def about_view(request):
    return render(request, 'about.html', {})

def howto_view(request):
    return render(request, 'howto.html', {})

