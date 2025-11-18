from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.core.exceptions import ValidationError
from django.db import transaction, IntegrityError
from django.db.models import ProtectedError, RestrictedError

from common.validators import normalize_form_data, format_balance_data

from api.serializers import get_serializer_class, RealEstateCustomSerializer, AgendaCustomSerializer

from parameters.models import Owner, Tenant, RealEstateType, TaxType
from realestates.models import RealEstate, Tax, Rent, RentStep, Expense, Collect, Agenda

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


@api_view(('GET', ))
def fetch_objects(request, model_name, depth):
    if model_name == 'propiedad':
        serializer = RealEstateCustomSerializer(RealEstate.objects.all(), many=True)
    elif model_name == 'agenda':
        serializer = AgendaCustomSerializer(Agenda.objects.all(), many=True)
    else:
        serializer_class = get_serializer_class(
            models_dic[model_name], '__all__', int(depth)
        )
        serializer = serializer_class(models_dic[model_name].objects.all(), many=True)

    return Response(serializer.data)


@api_view(('GET', ))
def fetch_related(request, related_model, related_depth, related_field, related_id):
    serializer_class = get_serializer_class(
        models_dic[related_model], '__all__', int(related_depth)
    )
    filter_kwargs = {f"{related_field}_id": int(related_id)}
    query_set = models_dic[related_model].objects.filter(**filter_kwargs)
    serializer = serializer_class(query_set, many=True)

    return Response(serializer.data)


@api_view(('GET', ))
def fetch_object(request, model_name, obj_id, depth):
    if not model_name:
        return Response({'error': 'No se ha determinado un modelo.'}, status=status.HTTP_400_BAD_REQUEST)
    if not obj_id:
        return Response({'error': 'No se ha determinado un id.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        obj = models_dic[model_name].objects.get(id=int(obj_id))
        if model_name == 'propiedad':
            serializer = RealEstateCustomSerializer(instance=obj)
        else:
            serializer_class = get_serializer_class(
                models_dic[model_name], '__all__', int(depth)
            )
            serializer = serializer_class(instance=obj)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except ValidationError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except models_dic[model_name].DoesNotExist:
        return Response({'error': f'No se encontró el objeto del modelo {model_name} con id {obj_id}.'}, status=status.HTTP_404_NOT_FOUND)
    except LookupError:
        return Response({'error': f'Nombre de modelo inválido ({model_name}).'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(('POST', ))
def create_object(request, model_name, depth):
    form_data = request.data
    if not form_data:
        return Response({'error': 'No se ha enviado la información.'}, status=status.HTTP_400_BAD_REQUEST)
    if not model_name:
        return Response({'error': 'No se ha determinado un modelo.'}, status=status.HTTP_400_BAD_REQUEST)

    form_data = normalize_form_data(models_dic[model_name], form_data)
    serializer_class = get_serializer_class(models_dic[model_name], '__all__', 0)
    serializer = serializer_class(data=form_data)

    if serializer.is_valid():
        try:
            instance = serializer.save()
            if model_name == 'propiedad':
                serializer = RealEstateCustomSerializer(instance=instance)
            elif model_name == 'agenda':
                serializer = AgendaCustomSerializer(instance=instance)
            else:
                serializer_class = get_serializer_class(models_dic[model_name], '__all__', int(depth))
                serializer = serializer_class(instance=instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({'error': {'__all__': [str(e)]}}, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError as e:
            return Response({'error': {'__all__': [str(e)]}}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
def update_object(request, model_name, obj_id, depth):
    form_data = request.data

    if not form_data:
        return Response({'error': 'No se ha enviado la información.'}, status=status.HTTP_400_BAD_REQUEST)

    if not model_name:
        return Response({'error': 'No se ha determinado un modelo.'}, status=status.HTTP_400_BAD_REQUEST)
    if not obj_id:
        return Response({'error': 'No se ha determinado un id.'}, status=status.HTTP_400_BAD_REQUEST)

    form_data = normalize_form_data(models_dic[model_name], form_data)

    serializer_class = get_serializer_class(models_dic[model_name], '__all__', 0)

    try:
        object_instance = models_dic[model_name].objects.get(id=int(obj_id))
    except ValidationError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except models_dic[model_name].DoesNotExist:
        return Response({'error': f'No se encontró el objeto del modelo {model_name} con id {obj_id}.'}, status=status.HTTP_404_NOT_FOUND)
    except LookupError:
        return Response({'error': f'Nombre de modelo inválido ({model_name}).'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = serializer_class(instance=object_instance, data=form_data)
    if serializer.is_valid():
        try:
            instance = serializer.save()
            if model_name == 'propiedad':
                serializer = RealEstateCustomSerializer(instance=instance)
            elif model_name == 'agenda':
                serializer = AgendaCustomSerializer(instance=instance)
            else:
                serializer_class = get_serializer_class(models_dic[model_name], '__all__', int(depth))
                serializer = serializer_class(instance=instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def delete_object(request, model_name, obj_id):
    if not model_name:
        return Response({'error': 'No se ha determinado un modelo.'}, status=status.HTTP_400_BAD_REQUEST)
    if not obj_id:
        return Response({'error': 'No se ha determinado un id.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            obj = models_dic[model_name].objects.get(id=int(obj_id))
            obj.delete()
            return Response({'success': True}, status=status.HTTP_200_OK)
    except ValidationError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except models_dic[model_name].DoesNotExist:
        return Response({'error': f'No se encontró el objeto del modelo {model_name} con id {obj_id}.'}, status=status.HTTP_404_NOT_FOUND)
    except ProtectedError as e:
        return Response({'error': f'No se puede eliminar porque está referenciado por otros objetos: {list(e.protected_objects)}'}, status=status.HTTP_400_BAD_REQUEST)
    except RestrictedError as e:
        return Response({'error': f'No se puede eliminar debido a restricción de integridad: {list(e.restricted_objects)}'}, status=status.HTTP_400_BAD_REQUEST)
    except LookupError:
        return Response({'error': f'Nombre de modelo inválido ({model_name}).'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def fetch_balance(request, re_id):
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

    result = {
        "expenses": expenses_data,
        "collects": collects_data,
        "balance": collects_data["grand_total"] - expenses_data["grand_total"]
    }

    return Response(result, status=status.HTTP_200_OK)
