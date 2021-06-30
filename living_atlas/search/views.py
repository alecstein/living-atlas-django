from django.shortcuts import render
from django.http import Http404, HttpResponse, JsonResponse
from search.models import Form, Lemma
from search.utils.view_utils import timer, render_to_excel_response,\
                                    render_to_carto_response
from django.db.utils import OperationalError
import re

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
    context = {}

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
            context['not_found_items_set'] = not_found_items_set

        elif query_type == 'regex':
            for key, sub in regex_substitutions.items():
                raw_query = raw_query.replace(key, sub)

            filter_args = {f'{lang}__regex': raw_query}

            lemma_qs = Lemma.objects.filter(**filter_args)

        lemma_qs = lemma_qs.prefetch_related('form_set')[:250]
        # results_dict = {}

        # try:
        #     for lemma in lemma_qs:
        #         form_qs = lemma.form_set.all()
        #         form_list = [form.name for form in form_qs if re_filter.search(form.name)]
        #         if form_list:
        #             results_dict[lemma] = form_list
        # except OperationalError:
        #     raise Http404("No result matches the given query.")

        json_data = {'lemmas':[]}
        for lemma in lemma_qs:
            form_qs = lemma.form_set.all()
            form_list = [form.name for form in form_qs if re_filter.search(form.name)]
            if form_list:
                json_data['lemmas'].append(
                    {'id': lemma.id,
                     'name': lemma.name,
                     'latin': lemma.latin,
                     'homid': lemma.homonym_id,
                     'forms': form_list,
                     'group': group,
                    })

        return JsonResponse(json_data)

        # if not results_dict:
        #     raise Http404("No result matches the given query.")

        # context['results_dict'] = results_dict
        # context['group'] = group
        # response = render(request, "query.html", context)
        # return response


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

    elif request.method == 'POST':
        post_to = request.POST['post_to']

        if post_to == "export":
            return render_to_excel_response(request)

        if post_to == "carto":

            return render_to_carto_response(request)