PYTHON ?= python3
VENV := backend/.venv
VENV_PY := $(VENV)/bin/python

.PHONY: setup setup-backend setup-frontend dev backend frontend test test-backend test-frontend

## One-time setup: install everything and create the database.
setup: setup-backend setup-frontend

setup-backend:
	$(PYTHON) -m venv $(VENV)
	$(VENV_PY) -m pip install -r backend/requirements.txt
	cd backend && .venv/bin/python manage.py migrate

setup-frontend:
	cd frontend && npm ci

## Run backend (port 8000) and frontend (port 5173) together.
dev:
	$(MAKE) -j2 backend frontend

backend:
	cd backend && .venv/bin/python manage.py runserver

frontend:
	cd frontend && npm run dev

## Run every test, backend and frontend.
test: test-backend test-frontend

test-backend:
	cd backend && .venv/bin/pytest

test-frontend:
	cd frontend && npm test
