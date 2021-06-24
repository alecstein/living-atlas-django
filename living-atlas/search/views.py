from django.shortcuts import render
from django.http import Http404
from .models import Form
from .utils.view_utils import render_to_excel_response, render_to_carto_response

# Create your views here.

def ajax_view(request):
    """
    Server API endpoint for fetching data
    N: limit of number of queries to fetch
    Note that 'form' is a linguistic object -- it does NOT have
    anything to do with a Django Form.
    """
    N = 10_000
    context = {}

    if request.method == 'GET':

        raw_query = request.GET.get('query')
        query_type = request.GET.get('type')
        group = request.GET.get('group')
        lang = request.GET.get('lang')
        form_filter = request.GET.get('form_filter')

        if query_type == 'list':
            query_items_set = set(raw_query.split(' '))
            if lang == 'lemma':
                form_queryset = Form.objects.filter(lemma__in = query_items_set)
            elif lang == 'latin':
                form_queryset = Form.objects.filter(latin__in = query_items_set)

            found_items_set = set(form_queryset.values_list(lang, flat = True))
            not_found_items_set = query_items_set.difference(found_items_set)
            context['not_found_items_set'] = not_found_items_set

        elif query_type == 'regex':
            if lang == 'lemma':
                form_queryset = Form.objects.filter(lemma__regex = f"{raw_query}")
            if lang == 'latin':
                form_queryset = Form.objects.filter(latin__regex = f"{raw_query}")

        if form_filter:
            form_queryset = form_queryset.filter(form__regex = f"{form_filter}")

        if not form_queryset:
            raise Http404("No Form matches the given query.")

        results_dict = {}
        form_values_list = form_queryset.values_list()[:N]
        for form, lemma, latin in form_values_list:
            if results_dict.get(lemma):
                results_dict[lemma]['forms'].append(form)
            else:
                results_dict[lemma] = {'latin':latin, 'forms':[form]}

        context['results'] = results_dict
        context['group'] = group

        response = render(request, "query.html", context)

        response['Limit'] = N
        if form_queryset.count() > N:
            response['Exceeds-Limit'] = form_queryset.count()

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