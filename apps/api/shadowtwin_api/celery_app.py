import os
import sys
from pathlib import Path

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "shadowtwin_api.settings.local")

ROOT_DIR = Path(__file__).resolve().parents[3]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

app = Celery("shadowtwin_api")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.conf.imports = (
    "apps.worker.worker.jobs.ingestion",
    "apps.worker.worker.jobs.notifications",
    "apps.worker.worker.jobs.recommendations",
)
app.autodiscover_tasks()
