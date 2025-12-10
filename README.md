# OrionixTrack

Integrated operations platform for transport fleet management. Replaces manual coordination with a transparent digital process for transport companies.

## Tech Stack

- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL 16, TypeORM
- **Realtime**: WebSocket (Socket.IO), MQTT (EMQX)
- **Auth**: JWT with role-based access control

## Features

- **Fleet Management**: Vehicles, GPS trackers, tracking channels
- **Trip Planning**: Create, assign drivers/vehicles, start/end trips
- **Real-time Monitoring**: Live vehicle positions on map via WebSocket
- **Public Tracking**: Shareable tracking links for customers
- **IoT Integration**: MQTT telemetry from GPS trackers

## User Roles

| Role       | Capabilities                                            |
|------------|---------------------------------------------------------|
| Owner      | Manage company, employees, vehicles, trackers, channels |
| Dispatcher | Plan trips, assign drivers, monitor active trips        |
| Driver     | View assigned trips, start/end trips                    |
| Public     | Track deliveries via public channels                    |

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### Setup

```bash
cp .env.example .env

docker-compose up --build
```

API runs on `http://localhost:3000`

### Database Migrations

```bash
npm run migration:generate -- src/common/migrations/MigrationName
npm run migration:run
npm run migration:revert
```

## API Documentation

Swagger UI available at `http://localhost:3000/api` when running in development mode.

## Production Deployment

For production deployment on VPS with Docker and GitHub Actions, see detailed instructions in [deployment/DEPLOYMENT.md](./deployment/DEPLOYMENT.md).

**Quick overview:**
1. Setup VPS with Docker
2. Configure GitHub Secrets (VPS_HOST, VPS_USER, VPS_SSH_KEY)
3. Push to `main` branch → automatic deployment

Docker images are published to GitHub Container Registry: `ghcr.io/YOUR_USERNAME/orionix-track:latest`
