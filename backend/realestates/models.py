from django.db import models
from django.core.exceptions import ValidationError
from parameters.models import RealEstateType, Owner, TaxType, Tenant

# Create your models here.


class RealEstate(models.Model):
    address = models.CharField(max_length=50, verbose_name="Dirección")
    floor = models.IntegerField(blank=True, null=True, verbose_name="Piso")
    unit = models.IntegerField(blank=True, null=True, verbose_name="Unidad")
    re_type = models.ForeignKey(RealEstateType, related_name='re_re_type', on_delete=models.RESTRICT)
    has_garage = models.CharField(max_length=2, default='NO')
    owner = models.ManyToManyField(Owner, related_name='re_owner', blank=True, verbose_name="Propietario")
    usufruct = models.ManyToManyField(Owner, related_name='re_usufruct', blank=True, verbose_name="Usufructo")
    buy_date = models.DateField(blank=True, null=True, verbose_name="Fecha de compra")
    buy_value = models.CharField(max_length=100, blank=True, null=True, verbose_name="Valor de compra")
    observations = models.CharField(max_length=500, blank=True, null=True, verbose_name="Observaciones")

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
        verbose_name = 'Propiedad'
        verbose_name_plural = 'Propiedades'


class Tax(models.Model):
    real_estate = models.ForeignKey(RealEstate, related_name='tax_re', on_delete=models.CASCADE)
    tax_type = models.ForeignKey(TaxType, related_name='tax_tax_type', on_delete=models.RESTRICT)
    tax_other = models.CharField(max_length=50, blank=True, null=True, verbose_name="Otro impuesto")
    tax_nbr1 = models.CharField(max_length=50, verbose_name="Número de impuesto")
    tax_nbr2 = models.CharField(max_length=50, blank=True, null=True, verbose_name="Número de impuesto secundario")
    taxed_person = models.CharField(max_length=60, blank=True, null=True, verbose_name="Titular del impuesto")
    observations = models.CharField(max_length=500, blank=True, null=True, verbose_name="Observaciones")

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
        verbose_name = 'Impuesto'
        verbose_name_plural = 'Impuestos'


class Rent(models.Model):
    real_estate = models.ForeignKey(RealEstate, related_name='rent_re', on_delete=models.CASCADE)
    date_from = models.DateField(verbose_name="Fecha desde")
    date_to = models.DateField(verbose_name="Fecha hasta")
    actualization = models.CharField(max_length=100, verbose_name="Actualización")
    tenant = models.ManyToManyField(Tenant, related_name='rent_tenant')
    administrator = models.CharField(max_length=100, blank=True, null=True, verbose_name="Administrador")
    observations = models.CharField(max_length=500, blank=True, null=True, verbose_name="Observaciones")

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
        verbose_name = 'Alquiler'
        verbose_name_plural = 'Alquileres'


class RentStep(models.Model):
    rent = models.ForeignKey(Rent, related_name='step_rent', on_delete=models.CASCADE)
    date_from = models.DateField(verbose_name="Fecha desde")
    date_to = models.DateField(verbose_name="Fecha hasta")
    rent_value = models.FloatField(blank=True, null=True, verbose_name="Valor")
    observations = models.CharField(max_length=500, blank=True, null=True, verbose_name="Observaciones")

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

    class Meta:
        verbose_name = 'Escalón'
        verbose_name_plural = 'Escalones'


class Expense(models.Model):
    real_estate = models.ForeignKey(RealEstate, related_name='expense_re', on_delete=models.CASCADE)
    pay_date = models.DateField(verbose_name="Fecha de gasto")
    pay_value = models.FloatField(verbose_name="Importe")
    expense_type = models.CharField(max_length=10, verbose_name="Tipo de gasto")
    tax = models.ForeignKey(Tax, related_name='expense_tax', on_delete=models.RESTRICT, blank=True, null=True)
    other_expense = models.CharField(max_length=200, blank=True, null=True, verbose_name="Otro gasto")
    observations = models.CharField(max_length=500, blank=True, null=True, verbose_name="Observaciones")

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
        verbose_name = 'Gasto'
        verbose_name_plural = 'Gastos'


class Collect(models.Model):
    real_estate = models.ForeignKey(RealEstate, related_name='collect_re', on_delete=models.CASCADE)
    col_date = models.DateField(verbose_name="Fecha de cobro")
    col_value = models.FloatField(verbose_name="Importe")
    col_type = models.CharField(max_length=10, verbose_name="Tipo de cobro")
    col_other = models.CharField(max_length=200, blank=True, null=True, verbose_name="Otro cobro")
    observations = models.CharField(max_length=500, blank=True, null=True, verbose_name="Observaciones")

    def clean(self):
        if self.col_type == 'OTRO' and not self.col_other:
            raise ValidationError('Ingrese un detalle de cobro')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        ordering = ('-col_date', )
        verbose_name = 'Ingreso'
        verbose_name_plural = 'Ingresos'


class Agenda(models.Model):
    real_estate = models.ForeignKey(RealEstate, related_name='agenda_re', on_delete=models.CASCADE, blank=True, null=True)
    agenda_date = models.DateField(verbose_name="Fecha")
    agenda_value = models.FloatField(blank=True, null=True, verbose_name="Importe")
    action = models.CharField(max_length=6, verbose_name="Acción")  # PAGAR/COBRAR/OTRO
    action_detail = models.CharField(max_length=8, verbose_name="Detalle (acción)")  # IMPUESTO/ALQUILER/OTRO
    detail = models.CharField(max_length=500, blank=True, null=True, verbose_name="Detalle")
    tax = models.ForeignKey(Tax, related_name='agenda_tax', on_delete=models.RESTRICT, blank=True, null=True)
    observations = models.CharField(max_length=500, blank=True, null=True, verbose_name="Observaciones")

    @property
    def re_name(self):
        re_name = self.real_estate.re_name if self.real_estate else ''
        return re_name

    def clean(self):
        if (self.action == 'OTRO' or self.action_detail == 'OTRO') and not self.detail:
            raise ValidationError('Ingrese un detalle')
        if self.action_detail == 'IMPUESTO' and not self.tax:
            raise ValidationError('Seleccione un impuesto a pagar')
        if self.action_detail == 'IMPUESTO' and not self.real_estate:
            raise ValidationError('Ingrese una propiedad')
        if (self.action == 'PAGAR' or self.action == 'COBRAR') and not self.agenda_value:
            raise ValidationError('Ingrese un importe')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['agenda_date']
        verbose_name = 'Agenda'
        verbose_name_plural = 'Agendas'
