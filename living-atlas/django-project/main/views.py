from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect
from .models import Form
import json
from time import time
# Create your views here.


def search_view(request):
    context = {}
    queryset = Form.objects.all()

    if request.method == 'GET':
        # Searchbox submission

        if request.GET.get('clear'):
            request.session.flush()
            return render(request, 'search.html', context)

        if request.GET.get('q'):
            # Normal query type
            query = request.GET.get('q')
            request.session['querytype'] = 'q'
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

        elif request.GET.get('r'):
            # Regex query type
            query = request.GET.get('r')
            request.session['query'] = query
            request.session['querytype'] = 'r'
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

        data = {}
        data['query_A'] = request.session['query_A']
        data['query_B'] = request.session['query_B']
        request.session.flush()
        return JsonResponse(data,status=200)
 
def about_view(request):
    return render(request, 'about.html', {})

def howto_view(request):
    return render(request, 'howto.html', {})

