from django.db import models

# Create your models here.

class Snippet(models.Model):
    name = models.CharField(max_length = 100)
    body = models.TextField()

    def __str__(self):
        return self.name