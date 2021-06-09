from django.shortcuts import render
from django.http import HttpResponse
# from .models import FrolexEntry
from .models import Form
import json
from time import time
# Create your views here.

# %%

# %%
def search1_view(request):
    """
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

    if request.method == 'GET':
        # Check to see if a non-regex query was submitted
        if request.GET.get('q'):
            query = request.GET.get('q')
            # Only accept lemmas which are not the empty string ''
            lemmas = set([lemma for lemma in query.strip().splitlines() if lemma.strip()])
            if len(lemmas) == 0:
                # If no valid lemmas are found, return invalid search page
                context['valid_search'] = False
                return render(request, 'search1.html', context)

            # Get all matching forms and lemmas
            context['valid_search'] = True
            forms = Form.objects.filter(lemma__in = lemmas)

            # Build a dictionary of the forms and lemmas
            # Lemmas are keys, a list of forms is the value
            form_dict = {}
            for form in forms:
                if form.form != form.lemma:
                    # Only include forms
                    try:
                        form_dict[form.lemma].append(form.form)
                    except KeyError:
                        form_dict[form.lemma] = [form.form]

            context['result_dict'] = form_dict
            return render(request, 'search1.html', context)

        if request.GET.get('r'):
            # Check to see if a regex query was submitted
            query = request.GET.get('r')
            if query == '':
                context['valid_search'] == False
                return render(request, 'search1.html', context)

            # Get all matching forms and lemmas
            context['valid_search'] = True
            forms = Form.objects.filter(lemma__regex =fr"{query}")[:2000]

            s = time()
            form_dict = {}
            for form in forms:
                if form.form != form.lemma:
                    # Only include forms
                    try:
                        form_dict[form.lemma].append(form.form)
                    except KeyError:
                        form_dict[form.lemma] = [form.form]
            print(time()-s)

            context['result_dict'] = form_dict
            # print(result_dict)
            return render(request, 'search1.html', context)


    if request.method == 'POST':
        # Form was submitted
        keys = [key for key in request.POST if key.startswith('checkbox')]
        selections = []
        for key in keys:
            selections.extend(request.POST.getlist(key))

        if len(selections) == 0:
            context['valid_submission'] = False
            return render(request, 'search1.html', context)

        context['valid_submission'] = True
        context['selections'] = selections

        return render(request, 'search2.html', context)

    return render(request, 'search1.html', context)

def search2_view(request):
    """
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

    if request.method == 'GET':
        # Check to see if a non-regex query was submitted
        if request.GET.get('q'):
            query = request.GET.get('q')
            # Only accept lemmas which are not the empty string ''
            lemmas = set([lemma for lemma in query.strip().splitlines() if lemma.strip()])
            if len(lemmas) == 0:
                # If no valid lemmas are found, return invalid search page
                context['valid_search'] = False
                return render(request, 'search2.html', context)

            # Get all matching forms and lemmas
            context['valid_search'] = True
            forms = Form.objects.filter(lemma__in = lemmas)

            # Build a dictionary of the forms and lemmas
            # Lemmas are keys, a list of forms is the value
            form_dict = {}
            for form in forms:
                if form.form != form.lemma:
                    # Only include forms
                    try:
                        form_dict[form.lemma].append(form.form)
                    except KeyError:
                        form_dict[form.lemma] = [form.form]

            context['result_dict'] = form_dict
            return render(request, 'search2.html', context)

        if request.GET.get('r'):
            # Check to see if a regex query was submitted
            query = request.GET.get('r')
            if query == '':
                context['valid_search'] == False
                return render(request, 'search2.html', context)

            # Get all matching forms and lemmas
            context['valid_search'] = True
            forms = Form.objects.filter(lemma__regex =fr"{query}")[:2000]

            s = time()
            form_dict = {}
            for form in forms:
                if form.form != form.lemma:
                    # Only include forms
                    try:
                        form_dict[form.lemma].append(form.form)
                    except KeyError:
                        form_dict[form.lemma] = [form.form]
            print(time()-s)

            context['result_dict'] = form_dict
            # print(result_dict)
            return render(request, 'search2.html', context)


    if request.method == 'POST':
        # Form was submitted
        keys = [key for key in request.POST if key.startswith('checkbox')]
        selections = []
        for key in keys:
            selections.extend(request.POST.getlist(key))

        if len(selections) == 0:
            context['valid_submission'] = False
            return render(request, 'search2.html', context)

        context['valid_submission'] = True
        context['selections'] = selections

        return render(request, 'search2.html', context)

    return render(request, 'search2.html', context)
 
def about_view(request):
    return render(request, 'about.html', {})

def howto_view(request):
    return render(request, 'howto.html', {})

