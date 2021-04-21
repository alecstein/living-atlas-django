from django.shortcuts import render
from .forms import HyperBaseQueryForm
from django.http import JsonResponse
import requests
import json

# Create your views here.
def query_hyperbase(request):

    if request.method == 'POST':
        form = HyperBaseQueryForm(request.POST)
        if form.is_valid():
            corpus_id = form.cleaned_data['corpus_id']
            corpus = form.cleaned_data['corpus']
            query = form.cleaned_data['query']

            url = f'http://hyperbase.unice.fr/hyperbase/api/search.php?corpus_id={corpus_id}&partition={corpus}&query="{query}"'
            print(url)
            response = requests.get(url)
            text_response = response.text
            json_response = json.loads(text_response)

            while json_response['status'] != '200':
                # Server contains a timeout and returns 'status' : '__WAIT__'
                # We keep looping until we get a valid response ('200')
                response = requests.get(url)
                text_response = response.text
                json_response = json.loads(text_response)

            context = {
                'form': form,
                'data': json_response['data'],
                }
            return render(request, 'lookup.html', context)

    form = HyperBaseQueryForm()
    context = {
        'form': form,
    }
    return render(request, 'lookup.html', context)