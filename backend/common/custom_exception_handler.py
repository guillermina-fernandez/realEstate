from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        # Normalize error format
        detail = response.data

        # If detail is a dict like {"field": ["error1"]}
        if isinstance(detail, dict):
            messages = []
            for field, errors in detail.items():
                if isinstance(errors, list):
                    for err in errors:
                        # Capitalize & clean messages
                        messages.append(f"{err[0].upper()}{err[1:]}")
                else:
                    messages.append(str(errors))

            response.data = {
                "error": " | ".join(messages)
            }

        # If detail is already just a string (e.g. PermissionDenied)
        elif isinstance(detail, list):
            response.data = {"error": " ".join(detail)}

        return response

    return response

