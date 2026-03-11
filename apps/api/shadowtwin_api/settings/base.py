from pathlib import Path
import os

import environ

BASE_DIR = Path(__file__).resolve().parents[4]
APPS_DIR = BASE_DIR / "apps" / "api"

env = environ.Env(
    DJANGO_DEBUG=(bool, False),
)

environ.Env.read_env(os.path.join(APPS_DIR, ".env"))

SECRET_KEY = env("DJANGO_SECRET_KEY", default="change-me")
DEBUG = env("DJANGO_DEBUG", default=False)
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "apps.accounts",
    "apps.authn",
    "apps.workspaces",
    "apps.twins",
    "apps.integrations",
    "apps.ingestion",
    "apps.memory",
    "apps.meetings",
    "apps.email_intelligence",
    "apps.actions",
    "apps.recommendations",
    "apps.approvals",
    "apps.automations",
    "apps.audit",
    "apps.privacy",
    "apps.notifications",
    "apps.billing",
    "apps.analytics",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "shadowtwin_api.urls"
WSGI_APPLICATION = "shadowtwin_api.wsgi.application"
ASGI_APPLICATION = "shadowtwin_api.asgi.application"
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]

DATABASES = {
    "default": env.db(
        "DATABASE_URL",
        default="postgresql://shadowtwin:shadowtwin@localhost:5432/shadowtwin",
    )
}

AUTH_USER_MODEL = "accounts.User"

LANGUAGE_CODE = "en-gb"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "apps.authn.authentication.ShadowTwinJWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

JWT_SIGNING_KEY = env("JWT_SIGNING_KEY", default=SECRET_KEY)
JWT_ISSUER = env("JWT_ISSUER", default="shadowtwin-api")
JWT_AUDIENCE = env("JWT_AUDIENCE", default="shadowtwin-clients")
JWT_ACCESS_LIFETIME_MINUTES = env.int("JWT_ACCESS_LIFETIME_MINUTES", default=15)
JWT_REFRESH_LIFETIME_DAYS = env.int("JWT_REFRESH_LIFETIME_DAYS", default=30)

GOOGLE_CLIENT_ID = env("GOOGLE_CLIENT_ID", default="")
GOOGLE_CLIENT_SECRET = env("GOOGLE_CLIENT_SECRET", default="")
GOOGLE_REDIRECT_URI = env(
    "GOOGLE_REDIRECT_URI",
    default="http://localhost:3000/workspace/integrations/google/callback",
)
INTEGRATION_ENCRYPTION_KEY = env("ENCRYPTION_KEY", default=SECRET_KEY)

CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=["http://localhost:3000", "http://localhost:8081"],
)

CELERY_BROKER_URL = env(
    "REDIS_URL",
    default="redis://localhost:6379/0",
)
CELERY_RESULT_BACKEND = CELERY_BROKER_URL
