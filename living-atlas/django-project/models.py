# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models

class FrolexEntry(models.Model):
    form = models.CharField(max_length=100, primary_key = True, blank=True, null=True)
    f_bfm = models.CharField(db_column='F_bfm', max_length=100, blank=True, null=True)  # Field name made lowercase.
    f_dmf = models.CharField(db_column='F_dmf', max_length=100, blank=True, null=True)  # Field name made lowercase
    msd_bfm = models.CharField(max_length=100, blank=True, null=True)
    msd_cattex_conv1 = models.CharField(max_length=100, blank=True, null=True)
    msd_cattex_conv2 = models.CharField(max_length=100, blank=True, null=True)
    lemma = models.CharField(max_length=100, blank=True, null=True)
    lemma_src = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.form

    class Meta:
        managed = False
        db_table = 'main_frolexentry'
