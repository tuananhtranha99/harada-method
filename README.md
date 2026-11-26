# Harada Pixel Quest

A Japanese **Harada Method (Open Window 64)** goal-tracking PWA with **Hardcore Pixel RPG** progression.

## Architecture
- `backend/`: Java 21 + Spring Boot 3.x REST API (Render + Supabase PostgreSQL + Flyway)
- `frontend/`: React + TypeScript + Vite PWA (Netlify + iOS Add-to-Home-Screen)

## Local Development

### 1. Environment Variables
Copy `.env.example` to `.env` and fill in your local PostgreSQL / Supabase credentials and JWT secret.

### 2. Backend
```bash
cd backend
mvn spring-boot:run
```
Swagger UI: `http://localhost:8080/swagger-ui.html`  
Health check: `http://localhost:8080/actuator/health`

### 3. Frontend (PWA)
```bash
cd frontend
npm install
npm run dev
```

