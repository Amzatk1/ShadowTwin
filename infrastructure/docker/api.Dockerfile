FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /workspace

COPY apps/api/pyproject.toml /tmp/apps-api-pyproject.toml
RUN pip install --no-cache-dir "django>=5.1" "djangorestframework>=3.15" "django-environ>=0.11" "django-cors-headers>=4.6" "psycopg[binary]>=3.2" "redis>=5.2" "celery>=5.4" "sentry-sdk>=2.19"

COPY . /workspace

