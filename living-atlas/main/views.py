from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseNotFound
from django.shortcuts import redirect
from .models import Form
import json
# Create your views here.

def ajax_view(request):
    """
    Server API endpoint for fetching data
    N: limit of number of queries to fetch
    queryset: models in the database, lazily evaluated
    """
    N = 2000

    context = {}
    queryset = Form.objects

    if request.method == 'GET':

        query = request.GET.get('query')
        query_type = request.GET.get('type')
        group = request.GET.get('group')

        if query_type == 'list':
            lemmas = set(query.split(' '))
            forms = queryset.filter(lemma__in = lemmas)

        elif query_type == 'regex':
            forms = queryset.filter(lemma__regex = fr"{query}")

        if len(forms) == 0:
            return HttpResponseNotFound("No results found")

        results = {}
        for form, lemma in forms.values_list()[:N]:
            if results.get(lemma):
                results[lemma].append(form)
            else:
                results[lemma] = [form]

        if query_type == 'list':
            not_found = []
            for lemma in lemmas:
                if lemma not in results.keys():
                    not_found.append(lemma)
            context['not_found'] = not_found

        context['results'] = results

        if group == 'A':
            return render(request, "groupA.html", context)

        elif group  == 'B':
            return render(request, "groupB.html", context)


def search_view(request):
    """
    The app revolves around this view, which is also the homepage.
    """
    context = {}

    if request.method == 'GET':
        return render(request, 'search.html', context)

    if request.method == 'POST':
        checked_A = {}
        checked_B = {}

        # All lemma keys are of the form {lemma}@{group}@.
        # All form keys are of the form {lemma}@{group}@{form}.
        # The "@" symbol will not appear in any other key.
        # Split the key_data into two parts, the lemma/group part
        # and the form part. The form part is either [] or [form]

        for key in request.POST:
            if "@" not in key:
                continue
            key_data = key.split("@")
            (lemma, group), form = key_data[:2], key_data[2:]
            if group == "A":
                if checked_A.get(lemma):
                    checked_A[lemma].extend(form)
                else:
                    checked_A[lemma] = list(form)
            if group == "B":
                if checked_B.get(lemma):
                    checked_B[lemma].extend(form)
                else:
                    checked_B[lemma] = list(form)

        context['query_A'] = checked_A
        context['query_B'] = checked_B

        response = JsonResponse(context, status=200)

        post_to = request.POST['post_to']

        if post_to == "export":
            response['Content-Type'] = 'application/json'
            response['Content-Disposition'] = 'attachment; filename="results.json"'

        return response

 
def about_view(request):
    return render(request, 'about.html', {})

def howto_view(request):
    return render(request, 'howto.html', {})

