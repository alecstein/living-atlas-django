from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import redirect
from .models import Form
import json
from time import time
# Create your views here.

# %%

# %%
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
        print('redirected')
        return redirect('/1/')

    # If we have succeeded with both search1 and search2, complete
    # if request.session.get('search2_successful', False):
    #     request.session.flush()
    #     return HttpResponse('data submitted')

    if request.method == 'POST':
        keys = [key for key in request.POST if key.startswith('checkbox')]
        selections = []
        for key in keys:
            selections.extend(request.POST.getlist(key))

        if len(selections) == 0:
            context['valid_submission'] = False
            print('no selections')
            return render(request, 'search2.html', context)

        # If we have not completed search2, update the 
        # session data for search1
        if not request.session.get('search2_successful', False):
            request.session['search1_selections'] = selections # save the selections
            context['search1_selections'] = selections

        else:
            request.session['search2_selections'] = selections
            context['search2_selections'] = selections
            print(request.session['search2_selections'])
            print(request.session['search1_selections'])
            return HttpResponse('data submitted')
        
        print("rendered post")
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
            print("reached unreachable")
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
        print(request.session.get('search1_selections'))

    return render(request, 'search2.html', context)
 
def about_view(request):
    return render(request, 'about.html', {})

def howto_view(request):
    return render(request, 'howto.html', {})

