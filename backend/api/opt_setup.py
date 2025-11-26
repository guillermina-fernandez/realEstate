import base64
import qrcode
from io import BytesIO
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.core.cache import cache

OTP_MAX_TRIES = 5  # Number of allowed failed attempts
OTP_LOCK_MINUTES = 10  # Lockout duration


def _is_locked_out(user_id):
    """Check if user is OTP locked out."""
    locked = cache.get(f"otp_lock_{user_id}")
    return locked is not None


def _increment_fail_count(user_id):
    """Count failed attempts and lock if exceeded."""
    key = f"otp_fail_{user_id}"
    fails = cache.get(key, 0) + 1
    cache.set(key, fails, OTP_LOCK_MINUTES * 60)

    if fails >= OTP_MAX_TRIES:
        cache.set(f"otp_lock_{user_id}", True, OTP_LOCK_MINUTES * 60)
    return fails


def _reset_fail_count(user_id):
    cache.delete(f"otp_fail_{user_id}")
    cache.delete(f"otp_lock_{user_id}")


@api_view(['POST'])
def otp_setup(request):
    # Manual authentication check
    if not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=401)

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

    # Properly encode the secret as base32
    secret = base64.b32encode(device.bin_key).decode('utf-8')

    return Response({
        "secret": secret,
        "otpauth_url": uri,
        "qr_image": f"data:image/png;base64,{qr_base64}",
    })


@api_view(['POST'])
def otp_activate(request):
    # Manual authentication check
    if not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=401)

    user = request.user

    # Check lockout
    if _is_locked_out(user.id):
        return Response({
            "error": f"Too many failed attempts. Try again in {OTP_LOCK_MINUTES} minutes."
        }, status=429)

    token = request.data.get("token")
    device = TOTPDevice.objects.filter(user=user, confirmed=False).first()

    if not device:
        return Response({"error": "No OTP setup in progress"}, status=400)

    # Invalid code → increment attempt counter
    if not device.verify_token(token):
        fails = _increment_fail_count(user.id)
        remaining = max(0, OTP_MAX_TRIES - fails)

        return Response({
            "error": "Invalid verification code.",
            "tries_left": remaining,
        }, status=400)

    # SUCCESS → confirm device
    device.confirmed = True
    device.save()

    # Reset fail counter
    _reset_fail_count(user.id)

    # ✅ Mark the user as OTP-verified in the session
    from django_otp import login as otp_login
    otp_login(request, device)

    # Create JWT tokens after successful activation
    from rest_framework_simplejwt.tokens import RefreshToken

    refresh = RefreshToken.for_user(user)

    return Response({
        "success": True,
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    })
