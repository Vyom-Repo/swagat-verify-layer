# 🛡️ Lakshya — Grievance Resolution Verifier System

Independent verification of government complaint resolutions using IVR + GPS evidence.

**Flow:** Citizen files complaint → Department marks resolved → System verifies via IVR call + field officer GPS → Dashboard shows truth.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| PostgreSQL | 14+ |
| Node.js | 18+ (for React dashboard only) |

---

## 🚀 Quick Start

### Step 1: Clone & Navigate

```bash
cd swagat-verify-layer
```

### Step 2: Create PostgreSQL Database

```bash
# Windows (adjust psql path if needed)
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE lakshya_db;"

# Run schema
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d lakshya_db -f database/schema.sql

# Seed dummy data
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d lakshya_db -f database/insert_dummy_data.sql
```

### Step 3: Configure Environment

```bash
copy .env.example .env
```

Edit `.env` with your PostgreSQL password:

```
DATABASE_URL=postgresql://postgres:jinil123@localhost:5432/lakshya_db
```

### Step 4: Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 5: Start the Server

```bash
uvicorn main:app --reload --port 8000
```

### Step 6: Build React Dashboard (one-time)

Open a new terminal:

```bash
cd frontend/dashboard
npm install
npm run build
```

---

## 🌐 Access Points

| Page | URL |
|------|-----|
| **API Root** | http://localhost:8000 |
| **Swagger Docs** | http://localhost:8000/docs |
| **Citizen/Officer Portal** | http://localhost:8000/static/index.html |
| **Collector Dashboard** | http://localhost:8000/static/dashboard/dist/index.html |

---

## 🎮 Demo Flow (No Twilio Needed)

1. Open **Portal** → **Department tab** → Click **✓ Mark Resolved** on any grievance
2. Status changes to `Verifying` and a simulated IVR call is created
3. Click the grievance card to open details → Use **Press 1** (satisfied) or **Press 2** (not satisfied) buttons
4. Verification engine runs automatically:
   - Press 2 → **Reopened**
   - GPS mismatch > 500m → **Reopened** (fraud)
   - All OK → **Verified Closed**
5. Open **Dashboard** to see updated stats, charts, and fraud alerts

---

## 📁 Project Structure

```
swagat-verify-layer/
├── .env                        # Your config (gitignored)
├── .env.example                # Config template
│
├── database/
│   ├── schema.sql              # Tables + ENUM + indexes
│   ├── insert_dummy_data.sql   # 20 grievances, 17 evidence logs
│   └── queries.sql             # Dashboard SQL queries
│
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── db.py                   # SQLAlchemy connection
│   ├── models.py               # ORM models
│   ├── requirements.txt        # Python dependencies
│   ├── routes/
│   │   ├── grievances.py       # POST/GET/PATCH grievances
│   │   ├── evidence.py         # Upload photo + GPS
│   │   ├── ivr.py              # Twilio webhook + simulate
│   │   └── dashboard.py        # Analytics endpoints
│   └── services/
│       ├── verification.py     # 4-rule verification engine
│       └── twilio_service.py   # IVR + simulation mode
│
└── frontend/
    ├── index.html              # 3-tab portal
    ├── css/style.css           # Dark theme
    ├── js/app.js               # Frontend logic
    └── dashboard/              # React + Vite app
        └── src/App.jsx         # Charts + tables
```

---

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/grievances/` | Submit complaint |
| `GET` | `/api/grievances/` | List (filter: `?status=Reopened&department_id=1`) |
| `GET` | `/api/grievances/{id}` | Detail + evidence |
| `PATCH` | `/api/grievances/{id}/resolve` | Mark resolved → Verifying |
| `POST` | `/api/evidence/{id}` | Upload GPS + photo |
| `POST` | `/api/ivr/simulate/{id}` | Simulate IVR (`{"keypress": 1}`) |
| `GET` | `/api/dashboard/stats` | Summary numbers |
| `GET` | `/api/dashboard/departments` | Per-department breakdown |
| `GET` | `/api/dashboard/fraud-alerts` | GPS mismatch flags |
| `GET` | `/api/dashboard/recent` | Recent activity |

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/lakshya_db` | PostgreSQL connection |
| `TWILIO_ACCOUNT_SID` | _(empty = simulation)_ | Twilio credentials |
| `TWILIO_AUTH_TOKEN` | _(empty = simulation)_ | Twilio credentials |
| `TWILIO_PHONE_NUMBER` | _(empty = simulation)_ | Twilio caller ID |
| `GPS_DISTANCE_THRESHOLD_METERS` | `500` | Max allowed GPS offset |
| `BASE_URL` | `http://localhost:8000` | Public URL for webhooks |

---

## 🧪 Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy, Uvicorn
- **Database:** PostgreSQL
- **Frontend:** HTML/CSS/JS (portal), React + Vite + Chart.js (dashboard)
- **IVR:** Twilio (with simulation mode)
- **Libraries:** geopy, psycopg2, python-multipart, python-dotenv
