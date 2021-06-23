# Useful links
Here are some useful links on how to install django in a production environment:
https://docs.bitnami.com/aws/infrastructure/django/get-started/deploy-django-project/

### Serving static files
In case you run into issues serving static files, check the top answer here and see if it helps.

https://stackoverflow.com/questions/63187103/static-files-not-being-served-on-aws-lightsail

# INSTALLED_APPS

## django-cachalot

To install, do
```
pip install django-cachalot
```
Then add
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'main', 
    'cachalot', # for caching searches
]
```
and
```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
        'LOCATION': '/tmp/django-cache',
        'OPTIONS': {
        'MAX_ENTRIES': 10_000
        }
    }
}

```
to `settings.py`.

`MAX_ENTRIES` is how many cached results to store. They're between 1-20kB each, so this is about 100mB of storage. Increase or decrease as you see fit.

# Django Production Server

## ALLOWED_HOSTS

You will need to set the allowed hosts to include the IP address of the server:
```python
ALLOWED_HOSTS = ['18.207.127.123', '*']
```

# Importing the data into the database

Use the `import-from-csv.py` file included. It will take 1-2 hours depending on the number of rows.
