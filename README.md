# Ethereum Watchdog

A real-time Ethereum transaction monitoring system that watches for specific transaction patterns based on dynamic rules and logs them into a PostgreSQL database. Built using Node.js, Prisma ORM, and Docker.

---

## ✅ Requirements

Make sure you have the following installed:

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (for container orchestration)
- [Node.js (v18+)](https://nodejs.org/) and npm (used for Prisma and tooling)
- **npm** – comes with Node.js, used for installing dependencies

---

## 📦 Project Structure

```
EthereumWatchdog/
├── api/
│   ├── configuration-rules/       # Rule manager API
│   └── transactions-watcher/      # Blockchain watcher
├── database/
│   ├── schema.sql                 # Initial DB schema
│   └── rules_notify_trigger.sql  # Notification trigger setup
├── prisma/
│   └── schema.prisma             # Prisma ORM schema
├── promtail/
│   └── promtail-config.yaml
├── docker-compose.yaml           # Docker service definitions
├── start.sh                      # Bootstrap script
└── README.md                     # You're reading this
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/EthereumWatchdog.git
cd EthereumWatchdog
```

### 2. Start Services

### Before running the bootstrap script check if 3000,3001,3100,5555 ports on your machine are free. If not, change them in docker-compose.yaml services definition!

Open bash console in the root level folder of the project and run the bootstrap script:

```bash
bash start.sh
```

This will:

- Generate a `.env` file
- Start PostgreSQL, Grafana, Loki, Promtail
- Wait for PostgreSQL to be ready
- Set up the schema and triggers
- Start both API containers (rule config and tx watcher)
- Launch Prisma Studio

---

## 🧠 Usage

### Rules API

Available endpoints:

- `POST /api/rules` — Add new rule
- `GET /api/rules` — Get all rules
- `GET /api/rules/:id` — Get a single rule
- `PUT /api/rules/:id` — Update an existing rule
- `DELETE /api/rules/:id` — Delete a rule

```bash
curl -X POST http://localhost:3000/api/rules \
  -H "Content-Type: application/json" \
  -d '{
    "min_eth_value": 1234,
    "max_eth_value": 12341234,
    "name": "Initial Rule"
  }'
```

## 🐳 Docker Services

```yaml
services:
  postgres         # Main DB
  grafana          # Dashboard UI| http://localhost:3001
  loki             # Logs aggregation
  promtail         # Log shipper
  configapi        # Rule management API
  txwatcher        # Ethereum listener
```

## 🔍 Viewing Rules and Transactions

You can browse the database using either:

- **Prisma Studio** (opened automatically at `http://localhost:5555` after running `start.sh`)

  Or launch manually:

  ```bash
  npx prisma studio --port 5555
  ```

- **DBVisualizer / DBeaver**  
  Connect to:

  - Host: `localhost`
  - Port: `5433`
  - Database: `transaction_watchdog`
  - User: `myuser`
  - Password: `mypass`

---

### Blockchain Monitoring

`txwatcher` listens for new Ethereum blocks via Infura, matches transactions to cached rules, and inserts matches into the database.

## 📊 Grafana and Logs

### Access Grafana

- Open your browser to [http://localhost:3001](http://localhost:3001)
- Log in with:
  - **Username:** `admin`
  - **Password:** `admin`

### Setup Loki as Data Source

1. Go to ⚙️ **Configuration** > **Data Sources**
2. Click **Add data source**
3. Choose **Loki**
4. Set:
   - **URL:** `http://loki:3100`
5. Click **Save & Test**

### View Logs

1. Navigate to 📈 **Explore**
2. Select your Loki data source from the dropdown
3. Use one of the following queries to filter logs:
   - `{filename="{YOUR_DOCKER_CONTAINER_ID}"}`
4. You can visualize logs in real-time as they stream from your containers

### Notes

1. Blockchain API has strong rate limitation - if the number of requests per user per time is exceeded, error for "Too many request can be seen"
