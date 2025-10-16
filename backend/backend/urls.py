"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from api.api_helper import fetch_objects, fetch_object, create_object, update_object, delete_object, fetch_related, fetch_balance

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/create/<str:model_name>/<str:depth>/', create_object),
    path('api/update/<str:model_name>/<str:obj_id>/<str:depth>/', update_object),
    path('api/delete/<str:model_name>/<str:obj_id>/', delete_object),
    path('api/related/<str:related_model>/<str:related_depth>/<str:related_field>/<str:related_id>/', fetch_related),
    path('api/<str:model_name>/<str:depth>/', fetch_objects),
    path('api/propiedad/<str:re_id>/balance/', fetch_balance),
    path('api/<str:model_name>/cod/<str:obj_id>/<str:depth>/', fetch_object),
]
