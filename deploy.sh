#!/bin/sh
cd /app

git fetch origin prod
git reset --hard origin/prod
git clean -fd

echo building project stack
docker compose up -d --build

echo building langflow stack
docker compose -f docker-compose-langflow.yml up -d --build