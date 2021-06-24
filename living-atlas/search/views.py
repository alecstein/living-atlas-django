from django.shortcuts import render
from django.http import Http404
# viking: PEP-8 specifies a single blank line between import groups.
# https://www.python.org/dev/peps/pep-0008/#imports
from .models import Form
from .utils.view_utils import render_to_excel_response, render_to_carto_response

# Create your views here.

# viking: PEP-8 specifies two blank lines around top-level items
# https://www.python.org/dev/peps/pep-0008/#blank-lines
def ajax_view(request):
    # viking: This is a bit of a generic name for a view.
    """
    Server API endpoint for fetching data
    N: limit of number of queries to fetch
    Note that 'form' is a linguistic object -- it does NOT have
    anything to do with a Django Form.
    """
    # viking: avoid such names where possible. It has no meaning, and despite
    # the docstring above it may be difficult to remember what N is for. 
    N = 10_000
    context = {}

    if request.method == 'GET':
        # viking: I'm a fan of vertical whitespace in general but this is
        # inconsistent with the other if statements.

        raw_query = request.GET.get('query')
        query_type = request.GET.get('type')
        group = request.GET.get('group')
        lang = request.GET.get('lang')
        form_filter = request.GET.get('form_filter')

        if query_type == 'list':
            query_items_set = set(raw_query.split(' '))
            # viking: minor note, but you can avoid the conditional with:
            #   filter_args = {f'{lang}__in': query_items_set}
            #   form_queryset = Form.objects.filter(**filter_args)
            # 
            if lang == 'lemma':
                form_queryset = Form.objects.filter(lemma__in = query_items_set)
            elif lang == 'latin':
                form_queryset = Form.objects.filter(latin__in = query_items_set)

            # viking: internally consistent styling is important, but so is
            # following existing standards. PEP-8 specifies no whitespace around
            # function arguments. See
            # https://www.python.org/dev/peps/pep-0008/#whitespace-in-expressions-and-statements
            found_items_set = set(form_queryset.values_list(lang, flat = True))

            not_found_items_set = query_items_set.difference(found_items_set)
            context['not_found_items_set'] = not_found_items_set

        elif query_type == 'regex':
            if lang == 'lemma':
                # viking: no need for the format string here, just pass in the
                # value: lemma_regex=raw_query
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
            # viking: results_dict.setdefault() may be useful here
            if results_dict.get(lemma):
                results_dict[lemma]['forms'].append(form)
            else:
                # viking: see note about whitespace in PEP-8, above
                results_dict[lemma] = {'latin':latin, 'forms':[form]}

        context['results'] = results_dict
        context['group'] = group

        # viking: maintain a consistent quote style, either
        # ' or ". if you need to mix styles (e.g. to quote a string containing
        # quotes itself) that's ok, but otherwise consistency is preferred.
        # FWIW: ' is one fewer keypress each time :)
        response = render(request, "query.html", context)

        response['Limit'] = N
        if form_queryset.count() > N:
            response['Exceeds-Limit'] = form_queryset.count()

        return response

# viking: PEP-8 specifies two blank lines around top-level items
# https://www.python.org/dev/peps/pep-0008/#blank-lines
def search_view(request):
    """
    The app revolves around this view, which is also the homepage.
    """
    if request.method == 'GET':
        return render(request, 'search.html')

    # viking: no need for elif here since you return early above.
    elif request.method == 'POST':

        post_to = request.POST['post_to']

        if post_to == "export":
            return render_to_excel_response(request)

        # viking: same here
        elif post_to == "carto":
            return render_to_carto_response(request)
