from django.shortcuts import render
from django.http import Http404, HttpResponse
from .models import Form, Lemma
from tqdm import tqdm
from time import time
from .utils.view_utils import timer, render_to_excel_response, render_to_carto_response
import re
from django.db import connection
# Create your views here.

regex_substitutions = {
    '£' : '[^aeiou]'
}

@timer
def ajax_view(request):
    """
    Server API endpoint for fetching data
    Note that 'form' is a linguistic object -- it does NOT have
    anything to do with a Django Form.
    """

    context = {}
    status = 200

    if request.method == 'GET':

        lemma_queryset = Lemma.objects.prefetch_related('form_set').all()

        raw_query = request.GET.get('query')
        query_type = request.GET.get('type')
        group = request.GET.get('group')
        lang = request.GET.get('lang')
        form_filter = re.compile(request.GET.get('form_filter', ''))

        if query_type == 'list':

            query_items_set = set(raw_query.split(' '))

            filter_args = {f'{lang}__in': query_items_set}
            lemma_queryset = lemma_queryset.filter(**filter_args)

            found_items_set = set([lemma.name for lemma in lemma_queryset])

            not_found_items_set = query_items_set.difference(found_items_set)
            context['not_found_items_set'] = not_found_items_set

        elif query_type == 'regex':

            for key, sub in regex_substitutions.items():
                raw_query = raw_query.replace(key, sub)

            filter_args = {f'{lang}__regex': raw_query}
            lemma_queryset = lemma_queryset.filter(**filter_args)

        lemma_queryset = lemma_queryset[:250]
        results_dict = {}

        for lemma in lemma_queryset:

            form_queryset = lemma.form_set.all()

            form_list = [form.name for form in form_queryset if form_filter.search(form.name)]

            if form_list:
                results_dict[lemma] = form_list

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

        if post_to == "carto":
            return render_to_carto_response(request)