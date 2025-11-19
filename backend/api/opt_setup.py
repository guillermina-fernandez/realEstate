import base64
import qrcode
from io import BytesIO
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_otp.plugins.otp_totp.models import TOTPDevice


@api_view(['POST'])
def otp_setup(request):
    user = request.user

    # Delete old unconfirmed devices
    TOTPDevice.objects.filter(user=user, confirmed=False).delete()

    # Create new TOTP device
    device = TOTPDevice.objects.create(
        user=user,
        name="default",
        confirmed=False,
    )

    # Generate provisioning URI
    uri = device.config_url

    # Generate QR code
    qr = qrcode.make(uri)
    buffer = BytesIO()
    qr.save(buffer, format='PNG')

    qr_base64 = base64.b64encode(buffer.getvalue()).decode()

    return Response({
        "secret": device.bin_key.decode(),
        "otpauth_url": uri,
        "qr_image": f"data:image/png;base64,{qr_base64}",
    })


@api_view(['POST'])
def otp_activate(request):
    from django_otp.plugins.otp_totp.models import TOTPDevice

    token = request.data.get("token")
    user = request.user

    device = TOTPDevice.objects.filter(user=user, confirmed=False).first()
    if not device:
        return Response({"error": "No OTP setup in progress"}, status=400)

    if device.verify_token(token):
        device.confirmed = True
        device.save()
        return Response({"success": True})

    return Response({"error": "Invalid token"}, status=400)

