# Travel Journal Application

A full-stack travel journal application with React frontend, Node.js backend, and PostgreSQL database.

## Project Structure

```
├── frontend/          # React + Vite frontend
├── backend/           # Node.js + Express backend
├── docker-compose.yml # Docker setup (dev + production)
└── env.example       # Environment variables template
```

## Quick Start

### Development Mode

1. **Start development services:**
   ```bash
   docker-compose --profile development up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - Database: localhost:5432

### Production Mode

1. **Start production services:**
   ```bash
   docker-compose --profile production up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:5001
   - Database: localhost:5432

## Manual Development Setup

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

### Database
Make sure PostgreSQL is running on port 5432 with the database `travel_journal`.

## Environment Variables

Copy `env.example` to `.env` and update the values as needed.

### OpenAI API Key

- To enable AI-generated summaries, set the `OPENAI_API_KEY` in `backend/.env` or your environment. Do NOT commit your real API key into the repository. Use `backend/.env.example` as a template.

Example (bash):

```bash
cd backend
cp .env.example .env
# edit .env to add OPENAI_API_KEY
export OPENAI_API_KEY="sk-..."
```

## Docker Commands

- **Development mode:** `docker-compose --profile development up --build`
- **Production mode:** `docker-compose --profile production up --build`
- **Start database only:** `docker-compose up db`
- **Stop services:** `docker-compose down`
- **View logs:** `docker-compose logs -f [service_name]`
- **Remove volumes:** `docker-compose down -v`

## Features

- ✅ Video background on homepage
- ✅ Responsive design
- ✅ Dark/Light theme toggle
- ✅ Travel journal entries
- ✅ User authentication (backend ready)
- ✅ PostgreSQL database
- ✅ Docker containerization
- ✅ Development and production environments

## API Endpoints

- `GET /` - Health check
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
 - `POST /api/summarize` - Ad-hoc summary generation using OpenAI (for testing)
 - `GET /api/journals` - List saved journals
 - `POST /api/journals` - Create a journal (generates AI summary and persists)
 - `PUT /api/journals/:id` - Update a journal (set `regenerateAI: true` to regenerate ai summary)
 - `DELETE /api/journals/:id` - Delete a journal

## Technologies

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Shadcn/ui
- **Backend:** Node.js, Express, PostgreSQL
- **Database:** PostgreSQL
- **Containerization:** Docker, Docker Compose
- **Web Server:** Nginx (production)