#!/bin/sh
set -eu

echo "Applying database migrations..."
alembic upgrade head

if [ "${ATI_WAIT_FOR_IMPORT:-0}" = "1" ]; then
    python scripts/wait_for_import.py
fi

echo "Starting Asset Tracking Intelligence API..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
