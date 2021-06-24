"""living-atlas URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from search.views import search_view, ajax_view
from pages.views import home_view, howto_view, about_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('ajax/', ajax_view, name = 'ajax'), # API endpoint
    path('search/', search_view, name = 'search'), # main page
    # viking: you can safely set this to search_view also, FYI
    path('', home_view, name = 'home'),
    path('howto/', howto_view, name = 'howto'),
    path('about/', about_view, name = 'about'),
]
