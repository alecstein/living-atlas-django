from django.db import models

# Create your models here.

class FrolexEntry(models.Model):
    """
    Frolex is the database that contains all the information about
    the lemmas and their associated variants.
    """
    form = models.CharField(max_length=100, primary_key = True, blank=True)
    f_bfm = models.CharField(db_column='F_bfm', max_length=100, blank=True, null=True)  # Field name made lowercase.
    f_dmf = models.CharField(db_column='F_dmf', max_length=100, blank=True, null=True)  # Field name made lowercase.
    msd_afrlex = models.CharField(max_length=100, blank=True, null=True)
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
