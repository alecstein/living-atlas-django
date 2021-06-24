from django.shortcuts import render
from django.http import Http404
from .models import Form, Lemma
from tqdm import tqdm
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
    N = 10_000
    context = {}

    if request.method == 'GET':

        raw_query = request.GET.get('query')
        query_type = request.GET.get('type')
        group = request.GET.get('group')
        lang = request.GET.get('lang')
        form_filter = request.GET.get('form_filter', '')

        if query_type == 'list':
            query_items_set = set(raw_query.split(' '))
            if lang == 'lemma':
                lemma_queryset = Lemma.objects.filter(lemma__in = query_items_set)
            elif lang == 'latin':
                lemma_queryset = Lemma.objects.filter(latin__in = query_items_set)

            found_items_set = set(lemma_queryset.values_list(lang, flat = True))
            not_found_items_set = query_items_set.difference(found_items_set)
            context['not_found_items_set'] = not_found_items_set

        elif query_type == 'regex':
            for key, sub in regex_substitutions.items():
                raw_query = raw_query.replace(key, sub)

            if lang == 'lemma':
                lemma_queryset = Lemma.objects.filter(lemma__regex = raw_query)
            elif lang == 'latin':
                lemma_queryset = Lemma.objects.filter(latin__regex = raw_query)

        if not lemma_queryset:
            raise Http404("No Form matches the given query.")

        results_dict = {}
        results_count = 0
        exceeds_limit = False
        for lemma_obj in tqdm(lemma_queryset):

            results_buffer = N - results_count
            if results_buffer <= 0:
                exceeds_limit = True
                break

            lemma = lemma_obj.lemma
            latin = lemma_obj.latin
            homonym_id = lemma_obj.homonym_id

            form_queryset = lemma_obj.form_set.filter(form__regex = form_filter)
            form_list = form_queryset.values_list("form", flat=True)[:results_buffer]
            form_list = list(form_list) + [lemma]

            results_count += len(form_list)
            results_dict[lemma] = {'form_list':form_list,
                                    'latin':latin,
                                    'homonym_id':homonym_id}

        context['results'] = results_dict
        context['group'] = group

        response = render(request, "query.html", context)

        response['Result-Limit'] = N
        if exceeds_limit:
            response['Exceeds-Limit'] = True


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