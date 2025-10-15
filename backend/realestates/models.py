from django.db import models
from django.core.exceptions import ValidationError
from parameters.models import RealEstateType, Owner, TaxType, Tenant

# Create your models here.


class RealEstate(models.Model):
    address = models.CharField(max_length=50)
    floor = models.IntegerField(blank=True, null=True)
    unit = models.IntegerField(blank=True, null=True)
    re_type = models.ForeignKey(RealEstateType, related_name='re_re_type', on_delete=models.RESTRICT)
    has_garage = models.CharField(max_length=2, default='NO')
    owner = models.ManyToManyField(Owner, related_name='re_owner', blank=True)
    usufruct = models.ManyToManyField(Owner, related_name='re_usufruct', blank=True)
    buy_date = models.DateField(blank=True, null=True)
    buy_value = models.CharField(max_length=100, blank=True, null=True)
    observations = models.CharField(max_length=500, blank=True, null=True)

    @property
    def re_name(self):
        re_name = self.address
        if self.floor:
            re_name += f' - Piso: {self.floor}'
        if self.unit:
            re_name += f' - Unidad: {self.unit}'
        return re_name

    class Meta:
        unique_together = ('address', 'floor', 'unit', )
        ordering = ('address', 'floor', 'unit', )


class Tax(models.Model):
    real_estate = models.ForeignKey(RealEstate, related_name='tax_re', on_delete=models.CASCADE)
    tax_type = models.ForeignKey(TaxType, related_name='tax_tax_type', on_delete=models.RESTRICT)
    tax_other = models.CharField(max_length=50, blank=True, null=True)
    tax_nbr1 = models.CharField(max_length=50)
    tax_nbr2 = models.CharField(max_length=50, blank=True, null=True)
    taxed_person = models.CharField(max_length=60, blank=True, null=True)
    observations = models.CharField(max_length=500, blank=True, null=True)

    def clean(self):
        if self.tax_type_id:
            tax_type_obj = TaxType.objects.get(id=self.tax_type_id)
            if tax_type_obj and tax_type_obj.tax_type == 'OTRO' and not self.tax_other:
                raise ValidationError('Detalle un nombre para el impuesto.')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        unique_together = ('tax_type', 'tax_nbr1', 'tax_nbr2', )
        ordering = ('tax_type', 'tax_other', 'tax_nbr1', 'tax_nbr2', )


class Rent(models.Model):
    real_estate = models.ForeignKey(RealEstate, related_name='rent_re', on_delete=models.CASCADE)
    date_from = models.DateField()
    date_to = models.DateField()
    actualization = models.CharField(max_length=100)
    tenant = models.ManyToManyField(Tenant, related_name='rent_tenant')
    administrator = models.CharField(max_length=100, blank=True, null=True)
    observations = models.CharField(max_length=500, blank=True, null=True)

    @property
    def tenants(self):
        tenants_list = [
            f'{t.last_name} {t.first_name} ({t.cuit})' for t in self.tenant.all()
        ]
        return ', '.join(tenants_list)

    def clean(self):
        if self.date_from > self.date_to:
            raise ValidationError("La fecha de Inicio no puede ser posterior a la fecha de Fin")
        overlapping_rents = Rent.objects.filter(
            real_estate=self.real_estate,
            date_from__lte=self.date_to,
            date_to__gte=self.date_from,
        ).exclude(pk=self.pk)
        if overlapping_rents.exists():
            raise ValidationError('Ya existe un contrato para las fechas seleccionadas')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        ordering = ('-date_to', )


class RentStep(models.Model):
    rent = models.ForeignKey(Rent, related_name='step_rent', on_delete=models.CASCADE)
    date_from = models.DateField()
    date_to = models.DateField()
    rent_value = models.FloatField(blank=True, null=True)
    observations = models.CharField(max_length=500, blank=True, null=True)

    def clean(self):
        if self.date_from > self.date_to:
            raise ValidationError("La fecha de Inicio no puede ser posterior a la fecha de Fin")

        overlapping_rents = RentStep.objects.filter(
            rent=self.rent,
            date_from__lte=self.date_to,
            date_to__gte=self.date_from,
        ).exclude(pk=self.pk)
        if overlapping_rents.exists():
            raise ValidationError('Ya existe un Escalón para las fechas seleccionadas')

        if self.rent:
            if self.date_from < self.rent.date_from or self.date_to > self.rent.date_to:
                raise ValidationError(
                    f"Las fechas del Escalón deben estar dentro de las fechas del Alquiler "
                    f"({self.rent.date_from} a {self.rent.date_to})."
                )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class Expense(models.Model):
    real_estate = models.ForeignKey(RealEstate, related_name='expense_re', on_delete=models.CASCADE)
    pay_date = models.DateField()
    pay_value = models.FloatField()
    expense_type = models.CharField(max_length=10)
    tax = models.ForeignKey(Tax, related_name='expense_tax', on_delete=models.RESTRICT, blank=True, null=True)
    other_expense = models.CharField(max_length=200, blank=True, null=True)
    observations = models.CharField(max_length=500, blank=True, null=True)

    def clean(self):
        if self.expense_type == 'IMPUESTO' and not self.tax:
            raise ValidationError('Seleccione un impuesto')
        elif self.expense_type == 'OTRO' and not self.other_expense:
            raise ValidationError('Ingrese un detalle de gasto')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        ordering = ('-pay_date', )