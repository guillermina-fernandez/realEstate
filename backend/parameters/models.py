from django.db import models
from common.validators import validate_cuit

# Create your models here.


class Owner(models.Model):
    last_name = models.CharField(max_length=30, verbose_name="Apellido")
    first_name = models.CharField(max_length=30, verbose_name="Nombre")
    cuit = models.CharField(max_length=13, validators=[validate_cuit], unique=True, verbose_name="CUIT")

    class Meta:
        ordering = ('last_name', 'first_name', )
        verbose_name = "Propietario"
        verbose_name_plural = "Propietarios"

    def __str__(self):
        return f'{self.last_name} {self.first_name}'


class Tenant(models.Model):
    last_name = models.CharField(max_length=30, verbose_name="Apellido")
    first_name = models.CharField(max_length=30, verbose_name="Nombre")
    cuit = models.CharField(max_length=13, validators=[validate_cuit], unique=True, verbose_name="CUIT")

    class Meta:
        ordering = ('last_name', 'first_name', )
        verbose_name = 'Inquilino'
        verbose_name_plural = 'Inquilinos'

    def __str__(self):
        return f'{self.last_name} {self.first_name}'


class RealEstateType(models.Model):
    re_type = models.CharField(max_length=20, unique=True, verbose_name="Tipo de propiedad")

    class Meta:
        ordering = ('re_type', )
        verbose_name = "Tipo de propiedad"
        verbose_name_plural = "Tipos de propiedad"


class TaxType(models.Model):
    tax_type = models.CharField(max_length=20, unique=True, verbose_name="Tipo de impuesto")

    class Meta:
        ordering = ('tax_type', )
        verbose_name = "Tipo de impuesto"
        verbose_name_plural = "Tipos de impuestos"

    def save(self, *args, **kwargs):
        if self.pk is not None:
            original = TaxType.objects.get(pk=self.pk)
            if original.tax_type == 'OTRO':
                raise ValueError("Este registro no puede ser modificado.")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.tax_type == 'OTRO':
            raise ValueError("Este registro no puede ser eliminado")
        super().delete(*args, **kwargs)