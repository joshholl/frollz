# Frollz - Film Roll Tracking System

A full-stack application for tracking film photography rolls, built with modern web technologies and containerized with Docker.

## Architecture

- **Backend**: NestJS with TypeScript, PostgreSQL database
- **Frontend**: Vue.js 3 with TypeScript and Tailwind CSS
- **Database**: PostgreSQL 18 for relational data storage
- **Containerization**: Docker and Docker Compose

## Features

### Film Management
- **Film Formats**: Define dimensional specifications for film stocks
- **Stocks**: Catalog of available film types with metadata (manufacturer, process, speed, etc.)
- **Rolls**: Individual film roll tracking with state management
- **Roll States**: Historical tracking of roll lifecycle

### Data Model

#### Film Formats
- Form Factor: Roll, Sheet, Instant, Bulk (100ft/400ft)
- Format: 35mm, 110, 120, 220, 4x5, 8x10, Instant formats

#### Stocks
- Process: ECN-2, E-6, C-41, Black & White
- Manufacturer and brand information
- ISO speed rating
- Tagging system for categorization
- Box image URL for visual reference

#### Rolls
- Unique roll identification
- Full lifecycle state machine with forward and backward transitions
- Acquisition tracking (date, method, source)
- X-ray exposure tracking
- Image album integration
- Tag system for roll-level categorization
- Per-roll transition history with direction annotation

## Roll Lifecycle

Film rolls progress through a defined lifecycle. Photographers can move rolls forward as they advance through the process, or backward to correct mistakes (marked as corrections in history).

### State Transition Table

| From State | Forward Transitions | Backward Transitions |
|---|---|---|
| **Added** | Frozen, Refrigerated, Shelved | — |
| **Frozen** | Refrigerated, Shelved | Added |
| **Refrigerated** | Shelved | Frozen, Added |
| **Shelved** | Loaded | Refrigerated, Frozen |
| **Loaded** | Finished | Shelved, Refrigerated, Frozen |
| **Finished** | Sent For Development | Loaded |
| **Sent For Development** | Developed | Finished |
| **Developed** | Received | Sent For Development |
| **Received** | — | Developed |

### State Descriptions

- **Added** — Roll has been acquired and logged in the system.
- **Frozen** — Roll is being stored in a freezer for long-term preservation.
- **Refrigerated** — Roll is in refrigerated storage (warmer than frozen; typical pre-shoot conditioning).
- **Shelved** — Roll is at room temperature and ready to be loaded into a camera.
- **Loaded** — Roll is currently in a camera being exposed.
- **Finished** — Roll has been fully exposed and removed from the camera.
- **Sent For Development** — Roll has been sent to a lab for chemical development.
- **Developed** — Lab has developed the roll.
- **Received** — Photographer has received negatives (and optionally scans) back from the lab.

### Backward Transitions

Backward transitions are allowed to correct mistakes (e.g., realizing a roll wasn't fully shot before marking it Finished). These are visually distinguished in the UI with an ↩ indicator and logged as corrections in the roll's history.

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frollz
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - API: http://localhost:3000
   - API Documentation: http://localhost:3000/api/docs

### Development

For local development without Docker:

**Backend Setup**
```bash
cd frollz-api
npm install
npm run start:dev
```

**Frontend Setup**
```bash
cd frollz-ui
npm install
npm run dev
```

## API Endpoints

### Film Formats
- `GET /api/film-formats` - List all formats
- `POST /api/film-formats` - Create new format
- `GET /api/film-formats/:key` - Get specific format
- `PATCH /api/film-formats/:key` - Update format
- `DELETE /api/film-formats/:key` - Delete format

### Stocks
- `GET /api/stocks` - List all stocks
- `POST /api/stocks` - Create new stock
- `GET /api/stocks/:key` - Get specific stock
- `PATCH /api/stocks/:key` - Update stock
- `DELETE /api/stocks/:key` - Delete stock

### Rolls
- `GET /api/rolls` - List all rolls
- `POST /api/rolls` - Create new roll
- `GET /api/rolls/:key` - Get specific roll
- `PATCH /api/rolls/:key` - Update roll
- `DELETE /api/rolls/:key` - Delete roll
- `POST /api/rolls/:key/transition` - Transition roll to a new state

### Roll Tags
- `GET /api/roll-tags` - List roll tags (filterable by `?rollKey=` or `?tagKey=`)
- `POST /api/roll-tags` - Assign a tag to a roll
- `DELETE /api/roll-tags/:key` - Remove a tag from a roll

## Database

The application uses PostgreSQL 18 as its primary database. Tables are automatically created on startup via DDL:

- `film_formats` - Film format specifications
- `stocks` - Film stock catalog
- `rolls` - Individual roll tracking
- `roll_states` - Roll state change history
- `tags` - Reusable tags (roll-scoped and/or stock-scoped)
- `stock_tags` - Stock ↔ tag assignments
- `roll_tags` - Roll ↔ tag assignments

## Environment Variables

### Backend (frollz-api)
```env
NODE_ENV=development
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DATABASE=frollz
POSTGRES_USER=frollz
POSTGRES_PASSWORD=frollz
PORT=3000
```

### Frontend (frollz-ui)
```env
VITE_API_URL=http://localhost:3000
```

## Docker Services

- **postgres**: PostgreSQL 18 database service on port 5432
- **frollz-api**: Backend API service on port 3000
- **frollz-ui**: Frontend application on port 5173

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
