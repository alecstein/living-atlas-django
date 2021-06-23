from django.shortcuts import render
from django.http import HttpResponseNotFound
from django.shortcuts import redirect
from .models import Form
from .utils.view_utils import render_to_excel_response, render_to_carto_response

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
        group = request.GET.get('group')
        lang = request.GET.get('lang')

        if request.GET['type'] == 'list':
            items = set(query.split(' '))

            if lang == 'lemma':
                forms = queryset.filter(lemma__in = items)
            elif lang == 'latin':
                forms = queryset.filter(latin__in = items)

            found = forms.values_list(lang, flat = True)
            not_found = [item for item in items if item not in found]
            context['not_found'] = not_found

        elif request.GET['type'] == 'regex':
            if lang == 'lemma':
                forms = queryset.filter(lemma__regex = f"{query}")
            if lang == 'latin':
                forms = queryset.filter(latin__regex = f"{query}")

        if request.GET.get('form_filter'):
            forms = forms.filter(form__regex = f"{form_filter}")

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

    elif request.method == 'POST':

        post_to = request.POST['post_to']

        if post_to == "export":
            return render_to_excel_response(request)

        elif post_to == "carto":
            return render_to_carto_response(request)
 
def about_view(request):
    return render(request, 'about.html', {})

def howto_view(request):
    return render(request, 'howto.html', {})

