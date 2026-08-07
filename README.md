# IC Verify AI - Automated Optical marking Inspection (AOI)

IC Verify AI is a production-quality inspection platform built for the Smart India Hackathon (SIH). It verifies Integrated Circuit (IC) markings, logo vectors, surface quality, and packaging outlines to detect counterfeits, remarked parts, or surface defects using Computer Vision and OCR algorithms.

## Project Structure

```
ic-verify-ai/
├── backend/
│   ├── main.py            # FastAPI main server & endpoints
│   ├── database.py        # SQLite connection, schemas & mock seeding
│   ├── analyzer.py        # OpenCV image processing CV stages analyzer
│   ├── verify_api.py      # Automated backend verification test script
│   └── static/uploads/    # Storage for uploaded and processed visual images
├── frontend/
│   ├── index.html         # HTML entry point (Outfit & Inter fonts)
│   ├── postcss.config.js  # PostCSS Tailwind config
│   ├── src/
│   │   ├── App.tsx        # React routes & Auth node selector
│   │   ├── main.tsx       # Vite entry point
│   │   ├── index.css      # Core styles & Tailwind v4 theme variables
│   │   ├── components/    # Layout elements (Sidebar, Header)
│   │   ├── pages/         # LandingPage, Dashboard, ReferenceDatabase, History, Analytics, Admin
│   │   └── services/      # Axios apiService client with offline simulation fail-safes
│   ├── package.json       # Frontend dependencies (Recharts, Framer Motion, Axios, jsPDF)
│   └── vite.config.ts     # Vite configuration
└── README.md              # This help guide
```

## Running the Application

### 1. Start the FastAPI Backend

1. Navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Start the FastAPI server on port `8000`:
   ```bash
   python main.py
   ```
   *The SQLite database `ic_verify.db` will automatically initialize and seed genuine device rules (NE555P, ATmega328P, STM32F103, etc.) on first launch.*

### 2. Start the React Vite Frontend

1. Navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```
2. Run the React development server:
   ```bash
   npm run dev
   ```
3. Open the app in your browser at `http://localhost:5173`.

### 3. Demo Credentials
For easy evaluation, use the one-click demo credentials in the login page or enter:
- **Administrator Node**: Username: `admin` | Password: `admin`
- **Operator Node**: Username: `operator` | Password: `operator`
