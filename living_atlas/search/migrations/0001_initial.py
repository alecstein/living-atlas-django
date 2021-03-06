# Generated by Django 3.2 on 2021-06-24 18:47

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Lemma',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('lemma', models.CharField(db_index=True, max_length=100)),
                ('latin', models.CharField(blank=True, db_index=True, max_length=100, null=True)),
                ('homonym_id', models.IntegerField(null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Form',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('form', models.CharField(max_length=100)),
                ('lemma', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='search.lemma')),
            ],
        ),
    ]
