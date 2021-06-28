from django.shortcuts import render, redirect

# Create your views here.

def about_view(request):
    return render(request, 'about.html', {})

def howto_view(request):
    return render(request, 'howto.html', {})

def home_view(request):
	return redirect('/search/')