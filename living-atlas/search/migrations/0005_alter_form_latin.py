# Generated by Django 3.2 on 2021-06-16 20:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0004_form_latin'),
    ]

    operations = [
        migrations.AlterField(
            model_name='form',
            name='latin',
            field=models.CharField(blank=True, db_index=True, max_length=100, null=True),
        ),
    ]
