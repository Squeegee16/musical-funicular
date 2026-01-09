#!/usr/bin/env bash
set -e

echo "=== Dispatch Globe Deployment ==="

if ! command -v docker >/dev/null; then
  echo "Docker not found. Aborting."
  exit 1
fi

if ! command -v docker compose >/dev/null; then
  echo "Docker Compose plugin not found. Aborting."
  exit 1
fi

if [ ! -f .env ]; then
  echo ".env not found. Copying from .env.example"
  cp .env.example .env
fi

echo "Pulling images..."
docker compose pull

echo "Starting stack..."
docker compose up -d

echo "Deployment complete."
echo "UI available at: http://localhost:8080"
