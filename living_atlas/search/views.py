from django.shortcuts import render
from django.http import Http404, HttpResponse, JsonResponse
from search.models import Form, Lemma
from search.utils.view_utils import timer, render_to_excel_response
from django.db.utils import OperationalError
import re
import json

# Create your views here.

regex_substitutions = {
    '£' : '[^aeiou]'
}


@timer
def ajax_view(request):
    """
    Server API endpoint for fetching data
    Any variable labeled *_qs is a Queryset
    Note that 'form' is a linguistic object -- it does NOT have
    anything to do with a Django Form.
    """
    json_data = {'lemmas': []}
    limit = 400
    hard_limit = 1000

    if request.method == 'GET':

        raw_query   = request.GET.get('query')
        query_type  = request.GET.get('type')
        group       = request.GET.get('group')
        lang        = request.GET.get('lang')
        form_filter = request.GET.get('form_filter', '')
        re_filter   = re.compile(form_filter)

        if query_type == 'list':
            query_items_set = set(raw_query.split(' '))
            filter_args = {f'{lang}__in': query_items_set}

            lemma_qs = Lemma.objects.filter(**filter_args)

            found_items_set = set([lemma.name for lemma in lemma_qs])
            not_found_items_set = query_items_set.difference(found_items_set)
            json_data['not_found_items_set'] = list(not_found_items_set)

        elif query_type == 'regex':
            for key, sub in regex_substitutions.items():
                raw_query = raw_query.replace(key, sub)

            filter_args = {f'{lang}__regex': raw_query}

            lemma_qs = Lemma.objects.filter(**filter_args)

        lemma_qs = lemma_qs.prefetch_related('form_set')

        if len(lemma_qs) > hard_limit:
            # 413 = Payload Too Large
            return HttpResponse(status = 413)
        
        for lemma in lemma_qs[:limit]:
            form_qs = lemma.form_set.all()
            form_list = [form.name for form in form_qs if re_filter.search(form.name)]
            if form_list:
                json_data['lemmas'].append({'id'   : lemma.id,
                                            'name' : lemma.name,
                                            'latin': lemma.latin,
                                            'homid': lemma.homonym_id,
                                            'forms': form_list,
                                            'group': group,})
        if not json_data['lemmas']:
            # 204 No Content
            return HttpResponse(status = 204)

        return JsonResponse(json_data)


def search_view(request):
    """
    The app revolves around this view, which is also the homepage.
    """

    if request.method == 'GET':
        # Test for Internet Explorer
        user_agent = request.META['HTTP_USER_AGENT']
        if any(ele in user_agent.lower() for ele in ['msie', 'trident']):
            return render(request, 'ie.html')

        return render(request, 'search.html')

    if request.method == 'POST':
        return cartography_view(request)

def excel_view(request):

    if request.method == 'POST':
        return render_to_excel_response(request)

def cartography_view(request):

    if request.method == 'POST':
        request_data = json.loads(request.body)
        json_data = json.dumps(request_data)
        response = JsonResponse(json_data, safe = False)
        response['message'] = 'submitted'
        return response