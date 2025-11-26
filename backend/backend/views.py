from django.http import FileResponse, Http404
import os


def react_app(request):
    index_path = os.path.join(
        '/home/ADMProp/realEstate/frontend/dist',
        'index.html'
    )

    if not os.path.exists(index_path):
        raise Http404("React build not found")

    return FileResponse(open(index_path, 'rb'))

