from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect
from .models import Form
import json
from time import time
# Create your views here.


def search_view(request):

    context = {}
    queryset = Form.objects.all()

    if request.method == 'GET':
        if request.GET.get('clear'):
            request.session.flush()
            return render(request, 'search.html', context)

        if request.GET.get('q'):
            # Normal query type
            query = request.GET.get('q')
            # Only accept lemmas which are not the empty string ''
            lemmas = set([lemma for lemma in query.strip().splitlines() if lemma.strip()])
            if len(lemmas) == 0:
                # If no valid queries are found, return same page
                return render(request, 'search.html', context)

            # Get all matching forms and lemmas
            forms = queryset.filter(lemma__in = lemmas)
            if len(forms) == 0:
                context['no_results'] = True
                return render(request, 'search.html', context)

            form_dict = {}
            for form in forms:
                if form.form != form.lemma:
                    # Only include forms
                    try:
                        form_dict[form.lemma].append(form.form)
                    except KeyError:
                        form_dict[form.lemma] = [form.form]

            if request.GET.get('query_A'):
                request.session['query_A'] = form_dict

            elif request.GET.get('query_B'):
                request.session['query_B'] = form_dict

            else: HttpResponse("Broken pipe")

        return render(request, 'search.html', context)

def search1_view(request):
    """
    The first search that the user makes is called 'search1'.
    The app revolves around this view, which is also the homepage.
    show_search: bool. whether or not to show the search results
    querylist: list of strings that are queried
    query: whatever someone types in the searchbox
    input_keys: list of keys that I use to get the checkboxes that have been selected
    selected_checkboxes: what it sounds like
    
    The filter selects all database objects with their lemma equal to
    the lemma(s) selected by the user
    """

    context = {}
    queryset = Form.objects.all()
    request.session.flush() # start a new session

    if request.method == 'GET':

        if request.GET.get('q'):
            # Normal query type
            query = request.GET.get('q')
            # Only accept lemmas which are not the empty string ''
            lemmas = set([lemma for lemma in query.strip().splitlines() if lemma.strip()])
            if len(lemmas) == 0:
                # If no valid lemmas are found, return invalid search page
                context['valid_search'] = False
            else:
                # Get all matching forms and lemmas
                context['valid_search'] = True
                forms = queryset.filter(lemma__in = lemmas)

        elif request.GET.get('r'):
            # Regex query type
            query = request.GET.get('r')
            if query == '':
                context['valid_search'] == False
            else:
                # Get all matching forms and lemmas
                context['valid_search'] = True
                forms = queryset.filter(lemma__regex =fr"{query}")[:2000]
        else:
            # Should be unreachable
            return render(request, 'search1.html', context)

        form_dict = {}
        for form in forms:
            if form.form != form.lemma:
                # Only include forms
                try:
                    form_dict[form.lemma].append(form.form)
                except KeyError:
                    form_dict[form.lemma] = [form.form]

        context['result_dict'] = form_dict
        request.session['search1_successful'] = True  

    return render(request, 'search1.html', context)

def search2_view(request):
    """
    The second search the user sees is called 'search2'.
    This search combines the form data from search1 with the 
    form data from search2 and outputs the results.

    show_search: bool. whether or not to show the search results
    querylist: list of strings that are queried
    query: whatever someone types in the searchbox
    input_keys: list of keys that I use to get the checkboxes that have been selected
    selected_checkboxes: what it sounds like
    
    The filter selects all database objects with their lemma equal to
    the lemma(s) selected by the user
    """

    context = {}
    queryset = Form.objects.all()
    # If we haven't succeeded with search1, return to search1
    if not request.session.get('search1_successful', False):
        request.session.flush()
        return redirect('/1/')

    if request.method == 'POST':

        # We need to make a dictionary out of the selected checkboxes
        # lemma checkboxes are labeled as checkbox-lemma
        # form checkboxes are labeled as checkbox-lemma-child

        selections_dict = {}

        lemma_selections = []
        for key in request.POST:
            if key.startswith('checkbox'):
                if 'child' not in key:
                    lemma_name = key.split('-')[1]
                    lemma_selections.append((key, lemma_name))

        for key, lemma_name in lemma_selections:
            key = key + "-child"
            selections_dict[lemma_name] = request.POST.getlist(key)


        # flatten the list
        selections_list = sorted({x for v in selections_dict.values() for x in v})

        if len(selections_list) == 0:
            context['valid_submission'] = False
            return render(request, 'search2.html', context)

        # If we have not completed search2, update the 
        # session data for search1
        if not request.session.get('search2_successful', False):
            request.session['search1_selections'] = selections_dict # save the selections
            context['search1_selections'] = selections_dict

        else:
            data = {}
            data['search1_selections'] = request.session['search1_selections']
            data['search2_selections'] = selections_list
            request.session.flush()
            return JsonResponse(data,status=200)
        
        return render(request, 'search2.html', context)

    if request.method == 'GET':

        if request.GET.get('q'):
            # Normal query type
            query = request.GET.get('q')
            # Only accept lemmas which are not the empty string ''
            lemmas = set([lemma for lemma in query.strip().splitlines() if lemma.strip()])
            if len(lemmas) == 0:
                # If no valid lemmas are found, return invalid search page
                context['valid_search'] = False
            else:
                # Get all matching forms and lemmas
                context['valid_search'] = True
                forms = queryset.filter(lemma__in = lemmas)

        elif request.GET.get('r'):
            # Regex query type
            query = request.GET.get('r')
            if query == '':
                context['valid_search'] == False
            else:
                # Get all matching forms and lemmas
                context['valid_search'] = True
                forms = queryset.filter(lemma__regex =fr"{query}")[:2000]
        else:
            # Should be unreachable
            request.session.flush()
            return render(request, 'search1.html', context)

        form_dict = {}
        for form in forms:
            if form.form != form.lemma:
                # Only include forms
                try:
                    form_dict[form.lemma].append(form.form)
                except KeyError:
                    form_dict[form.lemma] = [form.form]        

        request.session['search2_successful'] = True  
        context['result_dict'] = form_dict 
        context['search1_selections'] = request.session.get('search1_selections')

    return render(request, 'search2.html', context)
 
def about_view(request):
    return render(request, 'about.html', {})

def howto_view(request):
    return render(request, 'howto.html', {})

