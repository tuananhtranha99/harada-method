# PROJECT.md — Harada Pixel Quest

## 1. Overview
**Harada Pixel Quest** is a personal-first Progressive Web App (PWA) installable on iPhone (iOS 16.4+) and synced with PC. It combines the Japanese **Harada Method (Open Window 64)** with **Hardcore Pixel RPG** gamification.

## 2. Core Domain Model
- **User**: Owns a character profile, level, total XP, current streak, missed-day counter, and Harada goals.
- **Goal (Center Goal)**: The 1 overarching long-term goal at the center of the Open Window 64 grid.
- **Pillar (8 Sub-Goals / 8 RPG Stats)**:
  Each Goal has up to 8 Pillars. Each Pillar maps to an RPG character stat (e.g., `STR`, `INT`, `VIT`, `WIS`, `CHA`, `DEX`, `FOC`, `WIL`).
  - Users can start small (1 goal + a few pillars/actions) and expand gradually up to 64 actions (8 pillars × 8 actions).
- **Action (Up to 8 per Pillar)**:
  Concrete daily or milestone actions inside a Pillar.
- **Daily Action Log**:
  Records completion of an Action on a specific date (`log_date`).
  - **Pillar Lit-Up Rule**: A Pillar "lights up" for the day when **100% of active actions** in that Pillar are completed on that date.
- **Equipment & Vehicle Catalog (`gear_items`)**:
  Pixel-art weapons, armor, accessories, and vehicles unlocked automatically at fixed level milestones (overall level or pillar stat level).
- **Hardcore Penalty Rule (No Exceptions)**:
  - No rest days or streak shields.
  - Missing `X` consecutive days (default `X = 2`, configurable in `app_settings` / user profile) triggers a Hardcore penalty: character level/XP demotion or loss of unlocked gear.
- **Web Push Subscriptions**:
  Stores iOS/Desktop PWA push endpoints to send evening reminders before the Hardcore penalty triggers.

## 3. Tech Stack & Conventions
Follows the global `GEMINI.md` stack:
- **Backend**: Java 21 + Spring Boot 3.x (Maven), Flyway, PostgreSQL (Supabase), Spring Security + JWT, MapStruct, springdoc-openapi, Actuator (`/actuator/health`).
- **Frontend**: React + TypeScript + Vite PWA, feature-based folder structure, centralized `apiClient`, `manifest.json` + Service Worker (`sw.js`), deployed on Netlify.

