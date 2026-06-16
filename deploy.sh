#!/bin/sh
<<<<<<< Updated upstream
set -e

echo "========== APEXTRAINER DEPLOY START =========="
date

cd "$(dirname "$0")"

echo "Starting Docker Compose for ApexTrainer..."
docker compose up -d --build

echo "========== APEXTRAINER DEPLOY FINISHED =========="
date
=======
cd /app

git fetch origin prod
git reset --hard origin/prod
git clean -fd

echo building project stack
docker compose up -d --build

echo building langflow stack
docker compose -f docker-compose-langflow.yml up -d --build
>>>>>>> Stashed changes
