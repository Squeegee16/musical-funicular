#!/usr/bin/env bash

echo "Checking containers..."
docker compose ps

echo "Checking API..."
curl -sf http://localhost:3000/dispatch?range=day && echo "API OK"

echo "Checking frontend..."
curl -sf http://localhost:8080 >/dev/null && echo "Frontend OK"

echo "Verification complete."
