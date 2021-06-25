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
    N: limit of number of queries to fetch
    Note that 'form' is a linguistic object -- it does NOT have
    anything to do with a Django Form.
    """

    timeout = 4 # seconds
    context = {}
    status = 200

    if request.method == 'GET':

        raw_query = request.GET.get('query')
        query_type = request.GET.get('type')
        group = request.GET.get('group')
        lang = request.GET.get('lang')
        form_filter = request.GET.get('form_filter', '')

        lemma_queryset = Lemma.objects.prefetch_related('form_set')

        if query_type == 'list':
            query_items_set = set(raw_query.split(' '))
            if lang == 'lemma':
                lemma_queryset = lemma_queryset.filter(name__in = query_items_set)
            elif lang == 'latin':
                lemma_queryset = lemma_queryset.filter(latin__in = query_items_set)

            found_items_set = set(lemma_queryset.values_list(lang, flat = True))
            not_found_items_set = query_items_set.difference(found_items_set)
            context['not_found_items_set'] = not_found_items_set

        elif query_type == 'regex':
            for key, sub in regex_substitutions.items():
                raw_query = raw_query.replace(key, sub)

            if lang == 'lemma':
                lemma_queryset = lemma_queryset.filter(name__regex = raw_query)
            elif lang == 'latin':
                lemma_queryset = lemma_queryset.filter(latin__regex = raw_query)

        
        results_dict = {}

        start_time = time()
        for lemma in tqdm(lemma_queryset):

            # if time() - start_time > timeout:
                # status = 408
                # break

            lemma_name = lemma.name
            latin      = lemma.latin
            homonym_id = lemma.homonym_id

            form_queryset = lemma.form_set
            if form_filter:
                form_queryset = form_queryset.filter(name__regex = form_filter)
            form_list = form_queryset.values_list("name", flat=True)

            results_dict[lemma_name] = {'form_list':form_list,
                                        'latin':latin,
                                        'homonym_id':homonym_id}

        end_time = time()
        print('old way')
        print(end_time - start_time)

        if not results_dict:
            raise Http404("No result matches the given query.")

        context['results_dict'] = results_dict
        context['group'] = group

        response = render(request, "query.html", context, status = status)

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