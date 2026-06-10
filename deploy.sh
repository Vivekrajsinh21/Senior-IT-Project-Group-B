#!/bin/sh
set -e

echo "========== APEXTRAINER DEPLOY START =========="
date

cd "$(dirname "$0")"

echo "Starting Docker Compose for ApexTrainer..."
docker compose up -d --build

echo "========== APEXTRAINER DEPLOY FINISHED =========="
date
