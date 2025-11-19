from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError

from django.db import transaction, IntegrityError
from django.db.models import ProtectedError, RestrictedError

from common.validators import normalize_form_data, format_balance_data

from api.serializers import get_serializer_class, RealEstateCustomSerializer, AgendaCustomSerializer

from parameters.models import Owner, Tenant, RealEstateType, TaxType
from realestates.models import RealEstate, Tax, Rent, RentStep, Expense, Collect, Agenda


# ---------------------------------------------------------------------------
# MODEL MAPPING
# ---------------------------------------------------------------------------

models_dic = {
    'propietario': Owner,
    'inquilino': Tenant,
    'tipo_de_propiedad': RealEstateType,
    'tipo_de_impuesto': TaxType,
    'propiedad': RealEstate,
    'impuesto': Tax,
    'alquiler': Rent,
    'escalon': RentStep,
    'gasto': Expense,
    'cobro': Collect,
    'agenda': Agenda,
}


# ---------------------------------------------------------------------------
# SIMPLE ERROR RESPONSE
# ---------------------------------------------------------------------------

def error(msg, status_code=status.HTTP_400_BAD_REQUEST):
    """
    All errors go through this for consistency.
    Your custom exception handler will format DRFValidationError cases.
    """
    return Response({'error': msg}, status=status_code)


# ---------------------------------------------------------------------------
# FETCH OBJECTS
# ---------------------------------------------------------------------------

@api_view(['GET'])
def fetch_objects(request, model_name, depth):
    try:
        depth = int(depth)
        model = models_dic[model_name]
    except Exception:
        return error("Modelo inválido.")

    if model_name == 'propiedad':
        serializer = RealEstateCustomSerializer(model.objects.all(), many=True)
    elif model_name == 'agenda':
        serializer = AgendaCustomSerializer(model.objects.all(), many=True)
    else:
        serializer_class = get_serializer_class(model, '__all__', depth)
        serializer = serializer_class(model.objects.all(), many=True)

    return Response(serializer.data)


# ---------------------------------------------------------------------------
# FETCH RELATED
# ---------------------------------------------------------------------------

@api_view(['GET'])
def fetch_related(request, related_model, related_depth, related_field, related_id):
    try:
        model = models_dic[related_model]
        related_depth = int(related_depth)
        filter_kwargs = {f"{related_field}_id": int(related_id)}
    except Exception:
        return error("Parámetros inválidos.")

    queryset = model.objects.filter(**filter_kwargs)
    serializer_class = get_serializer_class(model, '__all__', related_depth)
    return Response(serializer_class(queryset, many=True).data)


# ---------------------------------------------------------------------------
# FETCH SINGLE OBJECT
# ---------------------------------------------------------------------------

@api_view(['GET'])
def fetch_object(request, model_name, obj_id, depth):
    if not model_name:
        return error("No se ha determinado un modelo.")
    if not obj_id:
        return error("No se ha determinado un ID.")

    try:
        depth = int(depth)
        model = models_dic[model_name]
        instance = model.objects.get(id=int(obj_id))
    except model.DoesNotExist:
        return error(f"No se encontró {model_name} con ID {obj_id}.", status.HTTP_404_NOT_FOUND)
    except Exception:
        return error("Parámetros inválidos.")

    if model_name == 'propiedad':
        serializer = RealEstateCustomSerializer(instance)
    else:
        serializer_class = get_serializer_class(model, '__all__', depth)
        serializer = serializer_class(instance)

    return Response(serializer.data)


# ---------------------------------------------------------------------------
# CREATE OBJECT
# ---------------------------------------------------------------------------

@api_view(['POST'])
def create_object(request, model_name, depth):
    if not request.data:
        return error("No se ha enviado la información.")
    if not model_name:
        return error("No se ha determinado un modelo.")

    try:
        model = models_dic[model_name]
        depth = int(depth)
    except Exception:
        return error("Modelo inválido.")

    form_data = normalize_form_data(model, request.data)
    serializer_class = get_serializer_class(model, '__all__', 0)
    serializer = serializer_class(data=form_data)

    # DRF handles validation cleanly
    serializer.is_valid(raise_exception=True)

    try:
        with transaction.atomic():
            instance = serializer.save()
    except DjangoValidationError as e:
        # Convert Django ValidationError → DRFValidationError
        raise DRFValidationError(e.message_dict)
    except IntegrityError as e:
        raise DRFValidationError(str(e))

    # Output serializer
    if model_name == 'propiedad':
        serializer = RealEstateCustomSerializer(instance)
    elif model_name == 'agenda':
        serializer = AgendaCustomSerializer(instance)
    else:
        read_serializer = get_serializer_class(model, '__all__', depth)
        serializer = read_serializer(instance)

    return Response(serializer.data)


# ---------------------------------------------------------------------------
# UPDATE OBJECT
# ---------------------------------------------------------------------------

@api_view(['PUT'])
def update_object(request, model_name, obj_id, depth):
    if not request.data:
        return error("No se ha enviado la información.")
    if not model_name:
        return error("No se ha determinado un modelo.")
    if not obj_id:
        return error("No se ha determinado un ID.")

    try:
        model = models_dic[model_name]
        depth = int(depth)
        instance = model.objects.get(id=int(obj_id))
    except model.DoesNotExist:
        return error(f"No se encontró {model_name} con ID {obj_id}.", status.HTTP_404_NOT_FOUND)
    except Exception:
        return error("Parámetros inválidos.")

    form_data = normalize_form_data(model, request.data)
    serializer_class = get_serializer_class(model, '__all__', 0)
    serializer = serializer_class(instance=instance, data=form_data)

    serializer.is_valid(raise_exception=True)

    try:
        with transaction.atomic():
            instance = serializer.save()
    except DjangoValidationError as e:
        raise DRFValidationError(e.message_dict)
    except IntegrityError as e:
        raise DRFValidationError(str(e))

    # Output serializer
    if model_name == 'propiedad':
        serializer = RealEstateCustomSerializer(instance)
    elif model_name == 'agenda':
        serializer = AgendaCustomSerializer(instance)
    else:
        read_serializer_class = get_serializer_class(model, '__all__', depth)
        serializer = read_serializer_class(instance)

    return Response(serializer.data)


# ---------------------------------------------------------------------------
# DELETE OBJECT
# ---------------------------------------------------------------------------

@api_view(['DELETE'])
def delete_object(request, model_name, obj_id):
    if not model_name:
        return error("No se ha determinado un modelo.")
    if not obj_id:
        return error("No se ha determinado un ID.")

    try:
        model = models_dic[model_name]
        instance = model.objects.get(id=int(obj_id))
    except model.DoesNotExist:
        return error(f"No se encontró {model_name} con ID {obj_id}.", status.HTTP_404_NOT_FOUND)
    except Exception:
        return error("Parámetros inválidos.")

    try:
        with transaction.atomic():
            instance.delete()
    except ProtectedError:
        return error("No se puede eliminar porque está referenciado por otros objetos.")
    except RestrictedError:
        return error("No se puede eliminar por restricciones de integridad.")

    return Response({'success': True})


# ---------------------------------------------------------------------------
# BALANCE
# ---------------------------------------------------------------------------

@api_view(['GET'])
def fetch_balance(request, re_id):
    try:
        re_id = int(re_id)
    except Exception:
        return error("ID inválido.")

    expenses_data = format_balance_data(
        model=Expense,
        re_id=re_id,
        serializer_class=get_serializer_class(Expense, '__all__', 2),
        date_field='pay_date',
        value_field='pay_value',
        nested_fields_to_remove=['tax']
    )

    collects_data = format_balance_data(
        model=Collect,
        re_id=re_id,
        serializer_class=get_serializer_class(Collect, '__all__', 0),
        date_field='col_date',
        value_field='col_value',
    )

    return Response({
        "expenses": expenses_data,
        "collects": collects_data,
        "balance": collects_data["grand_total"] - expenses_data["grand_total"]
    })


# ---------------------------------------------------------------------------
# PROCESS AGENDA
# ---------------------------------------------------------------------------

@api_view(['GET'])
def process_agenda(request, agenda_id):
    try:
        agenda = Agenda.objects.get(id=int(agenda_id))
    except Agenda.DoesNotExist:
        return error(f"No se encontró la agenda con ID {agenda_id}.", status.HTTP_404_NOT_FOUND)
    except Exception:
        return error("ID inválido.")

    try:
        with transaction.atomic():

            if agenda.action == 'PAGAR' and agenda.real_estate:
                Expense.objects.create(
                    real_estate=agenda.real_estate,
                    pay_date=agenda.agenda_date,
                    pay_value=agenda.agenda_value,
                    expense_type='IMPUESTO' if agenda.action_detail == 'IMPUESTO' else 'OTRO',
                    tax=agenda.tax,
                    other_expense=agenda.detail,
                    observations=agenda.observations
                )

            if agenda.action == 'COBRAR' and agenda.real_estate:
                Collect.objects.create(
                    real_estate=agenda.real_estate,
                    col_date=agenda.agenda_date,
                    col_value=agenda.agenda_value,
                    col_type='ALQUILER' if agenda.action_detail == 'ALQUILER' else 'OTRO',
                    col_other=agenda.detail,
                    observations=agenda.observations
                )

            agenda.delete()

    except ProtectedError:
        return error("No se puede procesar porque otros objetos lo referencian.")
    except RestrictedError:
        return error("No se puede procesar por restricciones de integridad.")

    return Response({'success': True})
