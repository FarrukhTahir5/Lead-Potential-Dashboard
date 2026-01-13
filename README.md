# Lead Potential Dashboard

A specialized dashboard for analyzing solar system data and identifying high-value lead opportunities for service upgrades and optimizations.

## Project Structure

```text
lead-potential-dashboard/
├── backend/            # Python/FastAPI backend for data processing
├── src/
│   ├── assets/         # Static assets (images, icons)
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # Business logic and scoring services
│   ├── types/          # TypeScript interfaces and types
│   ├── data/           # Mock data and initial datasets
│   └── styles/         # CSS and theme definitions
├── index.html
├── package.json
└── vite.config.ts
```

## Getting Started

### Frontend
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

### Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Run the main script:
   ```bash
   python main.py
   ```

## Key Features
- **Lead Scoring**: Advanced algorithm factoring in system age, health, and engagement.
- **Revenue Projection**: Real-time calculation of potential LTV based on system capacity.
- **Priority Management**: Automated categorization of leads into High, Medium, and Low bands.
