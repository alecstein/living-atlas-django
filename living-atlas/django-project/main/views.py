from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseNotFound
from django.shortcuts import redirect
from .models import Form
import json
# Create your views here.

def ajax_view(request):
    """
    Server API endpoint for fetching data
    """

    context = {}
    queryset = Form.objects

    if request.method == 'GET':
        query = request.GET.get('q')
        lemmas = set(query.split(' '))

        if request.GET.get('type') == 'list':
            forms = queryset.filter(lemma__in = lemmas)[:2000]

        elif request.GET.get('type') == 'regex':
            forms = queryset.filter(lemma__regex =fr"{query}")[:2000]


        if len(forms) == 0:
            return HttpResponseNotFound("No results found")

        form_dict = {}
        for x in forms.values():
            form = x['form']
            lemma = x['lemma']
            if form_dict.get(lemma):
                form_dict[lemma].append(form)
            else:
                form_dict[lemma] = [form]

        context['results'] = form_dict

        if request.GET.get('AorB') == 'qA':
            return render(request, "qA.html", context)

        elif request.GET.get('AorB') == 'qB':
            return render(request, "qB.html", context)


def search_view(request):
    """
    The app revolves around this view, which is also the homepage.
    """

    context = {}

    if request.method == 'GET':

        return render(request, 'search.html', context)

    if request.method == 'POST':

        selections_dict_A = {}
        selections_dict_B = {}

        lemma_selections_A = []
        lemma_selections_B = []

        for key in request.POST:
            if key.startswith('checkbox'):
                if 'child' not in key:
                    if key[-1] == 'A':
                        lemma_name = key.split('-')[1].strip('A')
                        lemma_selections_A.append((key, lemma_name))                        

                    elif key[-1] == 'B':
                        lemma_name = key.split('-')[1].strip('B')
                        lemma_selections_B.append((key, lemma_name))   

        for key, lemma_name in lemma_selections_A:
            key = key + "-child"
            selections_dict_A[lemma_name] = request.POST.getlist(key)

        for key, lemma_name in lemma_selections_B:
            key = key + "-child"
            selections_dict_B[lemma_name] = request.POST.getlist(key)


        data = {}
        data['query_A'] = selections_dict_A
        data['query_B'] = selections_dict_B

        return JsonResponse(data,status=200)
 
def about_view(request):
    return render(request, 'about.html', {})

def howto_view(request):
    print('test')
    return render(request, 'howto.html', {})

