import os
import sys
from pathlib import Path

from celery import Celery

ROOT_DIR = Path(__file__).resolve().parents[3]
API_DIR = ROOT_DIR / "apps" / "api"
for path in (ROOT_DIR, API_DIR):
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "shadowtwin_api.settings.local")

app = Celery("shadowtwin_worker")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.conf.imports = (
    "apps.worker.worker.jobs.ingestion",
    "apps.worker.worker.jobs.notifications",
    "apps.worker.worker.jobs.recommendations",
)
