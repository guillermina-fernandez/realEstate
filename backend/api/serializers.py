from rest_framework import serializers
from common.validators import UniqueTogetherWithNullAsEmpty

from realestates.models import RealEstate


def get_serializer_class(model_obj, field_names, depth_nbr):
    meta_validators = []

    if hasattr(model_obj._meta, 'unique_together'):
        for fields in model_obj._meta.unique_together:
            meta_validators.append(
                UniqueTogetherWithNullAsEmpty(
                    queryset=model_obj.objects.all(),
                    fields=fields,
                    model=model_obj
                )
            )

    if hasattr(model_obj._meta, 'constraints'):
        for constraint in model_obj._meta.constraints:
            constraint_fields = getattr(constraint, 'fields', None)
            if constraint_fields:
                meta_validators.append(
                    UniqueTogetherWithNullAsEmpty(
                        queryset=model_obj.objects.all(),
                        fields=constraint_fields,
                        model=model_obj
                    )
                )

    class CustomSerializer(serializers.ModelSerializer):
        class Meta:
            model = model_obj
            fields = '__all__' if field_names == '__all__' else tuple(field_names)
            depth = depth_nbr
            validators = meta_validators

        def to_representation(self, instance):
            rep = super().to_representation(instance)

            # Handle related objects dynamically when depth > 0
            if depth_nbr > 0:
                for field in instance._meta.get_fields():
                    # Skip reverse relations (one_to_many, many_to_one)
                    if field.one_to_many or field.one_to_one:
                        continue

                    # Handle ManyToMany and ForeignKey generically
                    if field.is_relation:
                        value = getattr(instance, field.name)

                        if field.many_to_many:
                            # Expand all related objects in M2M
                            related_qs = value.all()
                            rep[field.name] = [
                                get_serializer_class(
                                    field.related_model, '__all__', depth_nbr - 1
                                )(obj).data
                                for obj in related_qs
                            ]

                        elif not field.many_to_many:
                            # Expand single related object (FK, O2O)
                            if value:
                                rep[field.name] = get_serializer_class(
                                    field.related_model, '__all__', depth_nbr - 1
                                )(value).data

            return rep

    return CustomSerializer


class RealEstateCustomSerializer(serializers.ModelSerializer):
    re_type_name = serializers.CharField(source="re_type.re_type", read_only=True)
    owners = serializers.SerializerMethodField()
    usufructs = serializers.SerializerMethodField()
    re_name = serializers.ReadOnlyField()

    class Meta:
        model = RealEstate
        fields = [
            "id",
            "address",
            "floor",
            "unit",
            "re_type",
            "has_garage",
            "owner",
            "usufruct",
            "buy_date",
            "buy_value",
            "observations",
            "owners",
            "usufructs",
            "re_name",
            "re_type_name",
        ]

        validators = []

    @classmethod
    def attach_validators(cls):
        validators = []
        if hasattr(RealEstate._meta, 'unique_together'):
            for fields in RealEstate._meta.unique_together:
                validators.append(
                    UniqueTogetherWithNullAsEmpty(
                        queryset=RealEstate.objects.all(),
                        fields=fields,
                        model=RealEstate
                    )
                )
        if hasattr(RealEstate._meta, 'constraints'):
            for constraint in RealEstate._meta.constraints:
                constraint_fields = getattr(constraint, 'fields', None)
                if constraint_fields:
                    validators.append(
                        UniqueTogetherWithNullAsEmpty(
                            queryset=RealEstate.objects.all(),
                            fields=constraint_fields,
                            model=RealEstate
                        )
                    )
        cls.Meta.validators = validators

    def get_owners(self, obj):
        return ", ".join(f"{o.last_name} {o.first_name}" for o in obj.owner.all())

    def get_usufructs(self, obj):
        return ", ".join(f"{u.last_name} {u.first_name}" for u in obj.usufruct.all())


RealEstateCustomSerializer.attach_validators()
