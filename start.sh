#!/bin/bash

set -e
set -o pipefail

echo "📝 Creating .env file..."
cat > .env <<EOF
DB_HOST=postgres
DB_PORT=5432
DB_NAME=transaction_watchdog
DB_USER=myuser
DB_PASSWORD=mypass
DATABASE_URL=postgresql://myuser:mypass@postgres:5432/transaction_watchdog
INFURA_PROJECT_ID=8059b16544604915b32e6016f90736b4
EOF

echo "✅ .env file created."


echo "🚀 Starting infrastructure containers (PostgreSQL, Grafana, Loki, Promtail)..."
docker-compose up --build -d postgres grafana loki promtail configapi txwatcher

echo "⏳ Waiting for PostgreSQL to be ready..."
until docker exec postgres pg_isready -U myuser > /dev/null 2>&1; do
  sleep 1
done

echo "⏳ Waiting for 'config_rules' table to exist..."
until docker exec postgres psql -U myuser -d transaction_watchdog -c "SELECT 1 FROM config_rules LIMIT 1;" 2>/dev/null; do
  sleep 1
done

echo "🔔 Setting up NOTIFY trigger for rule updates..."
docker exec -i postgres psql -U myuser -d transaction_watchdog < ./database/rules_notify_trigger.sql

echo "✅ PostgreSQL is ready."

echo "📦 Installing dependencies..."
npm install

# Wait a few seconds to ensure services started before launching Studio
sleep 2

echo "🎨 Opening Prisma Studio..."
dotenv -e .env.studio -- npx prisma studio

# Handle Ctrl+C gracefully
trap "echo '🛑 Shutting down...'; kill $RULES_PID $TX_PID; docker-compose down; exit 0" SIGINT

wait
