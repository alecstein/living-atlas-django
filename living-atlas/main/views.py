from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseNotFound
from django.shortcuts import redirect
from .models import Form
import ast
# Create your views here.

def ajax_view(request):
    """
    Server API endpoint for fetching data
    N: limit of number of queries to fetch
    queryset: models in the database, lazily evaluated
    """
    N = 10_000

    context = {}
    queryset = Form.objects

    if request.method == 'GET':

        query = request.GET.get('query')
        query_type = request.GET.get('type')
        group = request.GET.get('group')
        lang = request.GET.get('lang')

        if query_type == 'list':
            items = set(query.split(' '))
            
            if lang == 'lemma':
                forms = queryset.filter(lemma__in = items)
            elif lang == 'latin':
                forms = queryset.filter(latin__in = items)

            found = forms.values_list(lang, flat = True)
            not_found = [item for item in items if item not in found]
            context['not_found'] = not_found

        elif query_type == 'regex':
            if lang == 'lemma':
                forms = queryset.filter(lemma__regex = fr"{query}")
            if lang == 'latin':
                forms = queryset.filter(latin__regex = fr"{query}")

        if not forms:
            return HttpResponseNotFound("No results found")

        results = {}
        for form, lemma, latin in forms.values_list()[:N]:
            if results.get(lemma):
                results[lemma]['forms'].append(form)
            else:
                results[lemma] = {'latin':latin, 'forms':[form]}

        context['results'] = results
        context['group'] = group
        response = render(request, "query.html", context)

        response['Limit'] = N
        if len(forms) > N:
            response['Exceeds-Limit'] = len(forms)

        return response

def search_view(request):
    """
    The app revolves around this view, which is also the homepage.
    """
    if request.method == 'GET':
        return render(request, 'search.html')

    if request.method == 'POST':
        json_data = {}

        # All lemma keys are of the form {lemma}@{group}@.
        # All form keys are of the form {lemma}@{group}@{form}
        # and have value {group}@{form}.
        # The "@" symbol will not appear in any other key,
        # and the "@" symbol will only appear in the value if the
        # checkbox corresponds to a form

        for key in request.POST:
            if "@" not in key: 
                continue
            value = request.POST[key]
            if "@" not in value:
                continue
            group, form = value.split("@")
            if json_data.get(group):
                json_data[group].append(form)
            else:
                json_data[group] = [form]

        response = JsonResponse(json_data, status=200)

        post_to = request.POST['post_to']

        if post_to == "export":
            response['Content-Type'] = 'application/json'
            response['Content-Disposition'] = 'attachment; filename="results.json"'

        return response

 
def about_view(request):
    return render(request, 'about.html', {})

def howto_view(request):
    return render(request, 'howto.html', {})

