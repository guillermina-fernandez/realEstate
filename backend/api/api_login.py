from rest_framework.decorators import api_view
from rest_framework.response import Response

from django.contrib.auth import login
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken


@api_view(['POST'])
def login_view(request):
    from django_otp.plugins.otp_totp.models import TOTPDevice
    from django_otp import devices_for_user
    from django.contrib.auth import login

    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if not user:
        return Response({"error": "Invalid credentials"}, status=401)

    devices = devices_for_user(user, confirmed=True)
    if len(list(devices)) == 0:
        # No 2FA yet → create session so otp_setup endpoint can authenticate
        login(request, user)  # ✅ This creates the Django session

        return Response({
            "otp_required": False,
            "setup_required": True,
            "user_id": user.id,
        })

    # Don't log in yet - they need to verify OTP first
    return Response({
        "otp_required": True,
        "setup_required": False,
        "user_id": user.id,
    })


@api_view(['POST'])
def otp_verify(request):
    from django.contrib.auth.models import User
    from django_otp.plugins.otp_totp.models import TOTPDevice
    from rest_framework_simplejwt.tokens import RefreshToken
    from django_otp import login as otp_login  # ✅ Import OTP login

    user_id = request.data.get("user_id")
    token = request.data.get("token")

    user = User.objects.get(id=user_id)
    device = TOTPDevice.objects.filter(user=user, confirmed=True).first()

    if not device or not device.verify_token(token):
        return Response({"error": "Invalid code"}, status=400)

    # Create session after successful OTP verification
    login(request, user)

    # ✅ Mark the user as OTP-verified in the session
    otp_login(request, device)

    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    })