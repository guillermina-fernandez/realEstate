from django.views.generic import TemplateView
from django.shortcuts import render
import os


def react_app(request):
    index_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        '..',
        'frontend',
        'dist',
        'index.html'
    )

    return render(request, index_path)
