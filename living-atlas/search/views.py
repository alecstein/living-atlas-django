from django.shortcuts import render
from django.http import Http404, HttpResponse
from .models import Form, Lemma
from tqdm import tqdm
from time import time
from .utils.view_utils import render_to_excel_response, render_to_carto_response

# Create your views here.

regex_substitutions = {
    '£' : '[^aeiou]'
}

def ajax_view(request):
    """
    Server API endpoint for fetching data
    Note that 'form' is a linguistic object -- it does NOT have
    anything to do with a Django Form.
    """

    context = {}
    status = 200

    s = time()
    if request.method == 'GET':

        raw_query = request.GET.get('query')
        query_type = request.GET.get('type')
        group = request.GET.get('group')
        lang = request.GET.get('lang')
        form_filter = request.GET.get('form_filter')

        if query_type == 'list':

            query_items_set = set(raw_query.split(' '))

            filter_args = {f'{lang}__in': query_items_set}
            lemma_queryset = Lemma.objects.filter(**filter_args)

            found_items_set = set(lemma_queryset.values_list(lang, flat = True))

            not_found_items_set = query_items_set.difference(found_items_set)
            context['not_found_items_set'] = not_found_items_set

        elif query_type == 'regex':

            for key, sub in regex_substitutions.items():
                raw_query = raw_query.replace(key, sub)

            filter_args = {f'{lang}__regex': raw_query}
            lemma_queryset = Lemma.objects.filter(**filter_args)

        lemma_queryset = lemma_queryset[:300]
        results_dict = {}

        # https://github.com/nyergler/effective-django/blob/master/orm.rst#query-performance
        
        for lemma in lemma_queryset:

            form_list = lemma.form_set.values_list("name", flat=True)

            if form_filter:
                form_list = form_list.filter(name__regex = form_filter)

            results_dict[lemma] = form_list

        if not results_dict:
            raise Http404("No result matches the given query.")

        context['results_dict'] = results_dict
        context['group'] = group

        response = render(request, "query.html", context, status = status)
        print(time()-s)
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

        if post_to == "carto":
            return render_to_carto_response(request)