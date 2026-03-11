import base64
import hashlib

from cryptography.fernet import Fernet
from django.conf import settings


def _build_fernet() -> Fernet:
    digest = hashlib.sha256(settings.INTEGRATION_ENCRYPTION_KEY.encode("utf-8")).digest()
    return Fernet(base64.urlsafe_b64encode(digest))


def encrypt_secret(value: str) -> str:
    if not value:
        return ""
    return _build_fernet().encrypt(value.encode("utf-8")).decode("utf-8")


def decrypt_secret(value: str) -> str:
    if not value:
        return ""
    return _build_fernet().decrypt(value.encode("utf-8")).decode("utf-8")
