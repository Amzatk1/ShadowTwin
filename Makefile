install-web:
	npm install

run-web:
	npm run dev:web

run-mobile:
	npm run dev:mobile

run-api:
	python apps/api/manage.py runserver 0.0.0.0:8000

run-worker:
	python -m celery -A apps.worker.worker.celery_app worker -l info

migrate:
	python apps/api/manage.py migrate

seed:
	python apps/api/manage.py seed_shadowtwin_demo

test-api:
	python apps/api/manage.py test
