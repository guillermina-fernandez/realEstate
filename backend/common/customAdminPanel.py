from django.apps import AppConfig, apps
from django.contrib import admin


class ListAdminMixin(object):

    def __init__(self, model, admin_site):
        self.list_display = [field.name for field in model._meta.fields]
        super(ListAdminMixin, self).__init__(model, admin_site)


class CustomAdminConfig(AppConfig):

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'custom_admin'

    def ready(self):
        register_models_with_custom_admin()


def register_models_with_custom_admin():

    models = apps.get_models()
    for model in models:
        admin_class = type('AdminClass', (ListAdminMixin, admin.ModelAdmin), {})
        try:
            admin.site.register(model, admin_class)
        except admin.sites.AlreadyRegistered:
            pass