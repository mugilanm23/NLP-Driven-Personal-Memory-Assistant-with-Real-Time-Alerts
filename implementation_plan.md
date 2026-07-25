# Implementation Plan - AI-Enhanced Personal Memory Assistant

This plan outlines the steps to upgrade the "NLP-Driven Personal Memory Assistant with Real-Time Alerts" into a professional personal memory assistant. We will remove third-party date parsing dependencies, write a robust rule-based NLP engine, integrate Gemini API for smart priority prediction, implement comprehensive status tracking and recurring reminders, improve email alerts with professional HTML templates, and build a beautiful, high-performance glassmorphic UI.

## User Review Required

> [!IMPORTANT]
> **Gemini API Key Configuration**
> - You will need to add a `GEMINI_API_KEY` to your backend `.env` file for the Smart Priority Prediction feature. If not provided or if the API call fails, the system will fall back to local rule-based keyword detection.
> - The new schema updates add `status` and `repeat_type` columns to the database. We will provide a migration script `migrate.js` that automatically applies these schema updates without losing your existing database data.

## Open Questions

None at this stage. All requirements are clear and detailed.

## Proposed Changes

We will restructure the project to follow clean architecture principles, separating concerns into controllers, routes, services, and utility functions.

---

### Database Schema

#### [NEW] [schema.sql](file:///c:/Users/mugil/Desktop/Projects/Others/NLP-Driven%20Personal%20Memory%20Assistant%20with%20Real-Time%20Alerts/backend/config/schema.sql)
Create a reference database schema file that defines the table structure, including columns for tracking status and recurrence type:
- `status` ENUM('PENDING', 'TRIGGERED', 'MISSED')
- `repeat_type` ENUM('NONE', 'DAILY', 'WEEKLY', 'MONTHLY')

#### [NEW] [migrate.js](file:///c:/Users/mugil/Desktop/Projects/Others/NLP-Driven%20Personal%20Memory%20Assistant%20with%20Real-Time%20Alerts/backend/config/migrate.js)
A migration script that will check the existing database structure and run the `ALTER TABLE` statements to add `status` and `repeat_type` if they do not exist.

---

### Backend Services & Utilities

#### [MODIFY] [package.json](file:///c:/Users/mugil/Desktop/Projects/Others/NLP-Driven%20Personal%20Memory%20Assistant%20with%20Real-Time%20Alerts/backend/package.json)
- Remove `chrono-node` dependency.
- Add `@google/generative-ai` dependency for priority prediction.

#### [NEW] [geminiService.js](file:///c:/Users/mugil/Desktop/Projects/Others/NLP-Driven%20Personal%20Memory%20Assistant%20with%20Real-Time%20Alerts/backend/services/geminiService.js)
A service to call Gemini API using the official SDK. It prompts Gemini to return exactly one value: `LOW`, `NORMAL`, or `HIGH` based on the reminder title. It includes a fallback to rule-based keywords (`urgent`, `critical`, etc.) if the API fails or is not configured.

#### [MODIFY] [parser.js](file:///c:/Users/mugil/Desktop/Projects/Others/NLP-Driven%20Personal%20Memory%20Assistant%20with%20Real-Time%20Alerts/backend/utils/parser.js)
A custom rule-based NLP parser performing:
1. Text Cleaning: Lowercase conversions and boundary cleaning.
2. Date Detection: Parse phrases like `today`, `tomorrow`, `day after tomorrow`, `next week`, `next [weekday]`.
3. Time Detection: Parse standard formats (`5pm`, `5 pm`, `10:30 am`, `18:00`).
4. Intent Detection: Determine if input is a command to CREATE a reminder or a query to RETRIEVE reminders (today, week, high-priority, upcoming, completed).
5. Title Extraction: Strip date/time phrases and filter words (`remind me`, `to`, `please`, `at`, etc.) to isolate the clean task title.

#### [MODIFY] [email.js](file:///c:/Users/mugil/Desktop/Projects/Others/NLP-Driven%20Personal%20Memory%20Assistant%20with%20Real-Time%20Alerts/backend/utils/email.js)
Upgrade the text-based email to a professional HTML email with a responsive template, distinct priority labels, and structured metadata tables.

#### [MODIFY] [cron.js](file:///c:/Users/mugil/Desktop/Projects/Others/NLP-Driven%20Personal%20Memory%20Assistant%20with%20Real-Time%20Alerts/backend/utils/cron.js)
- Check scheduled reminders every minute.
- Set status to `TRIGGERED` when executed.
- Set status to `MISSED` if overdue.
- For recurring reminders (`DAILY`, `WEEKLY`, `MONTHLY`), calculate the next date and insert it as a new `PENDING` reminder to preserve history.

---

### Backend Routes & Controllers

#### [MODIFY] [server.js](file:///c:/Users/mugil/Desktop/Projects/Others/NLP-Driven%20Personal%20Memory%20Assistant%20with%20Real-Time%20Alerts/backend/server.js)
- Include routes for both reminders and memory retrieval.
- Automatically execute the database migration script on startup.

#### [MODIFY] [reminderController.js](file:///c:/Users/mugil/Desktop/Projects/Others/NLP-Driven%20Personal%20Memory%20Assistant%20with%20Real-Time%20Alerts/backend/controllers/reminderController.js)
- Use the new parser and Gemini priority service to save reminders with status and repeat types.
- If NLP parsing detects a `RETRIEVE` intent, execute a retrieve database call and return the list directly, allowing conversational search.

#### [NEW] [memoryController.js](file:///c:/Users/mugil/Desktop/Projects/Others/NLP-Driven%20Personal%20Memory%20Assistant%20with%20Real-Time%20Alerts/backend/controllers/memoryController.js)
Implement endpoints for the memory retrieval engine:
- `GET /api/memory/today`
- `GET /api/memory/week`
- `GET /api/memory/high-priority`
- `GET /api/memory/upcoming`
- `GET /api/memory/completed`
- `GET /api/memory/stats` (to return total, pending, triggered, missed, and high-priority counts)

#### [NEW] [memoryRoutes.js](file:///c:/Users/mugil/Desktop/Projects/Others/NLP-Driven%20Personal%20Memory%20Assistant%20with%20Real-Time%20Alerts/backend/routes/memoryRoutes.js)
Expose the memory retrieval endpoints to the client.

#### [MODIFY] [reminderRoutes.js](file:///c:/Users/mugil/Desktop/Projects/Others/NLP-Driven%20Personal%20Memory%20Assistant%20with%20Real-Time%20Alerts/backend/routes/reminderRoutes.js)
Maintain CRUD routes, ensuring compatibility.

---

### Frontend UI Redesign

#### [MODIFY] [index.html](file:///c:/Users/mugil/Desktop/Projects/Others/NLP-Driven%20Personal%20Memory%20Assistant%20with%20Real-Time%20Alerts/frontend/index.html)
- Add typography stylesheet link (Google Font: Outfit).
- Set title and meta tags.

#### [MODIFY] [index.css](file:///c:/Users/mugil/Desktop/Projects/Others/NLP-Driven%20Personal%20Memory%20Assistant%20with%20Real-Time%20Alerts/frontend/src/index.css)
- Reset base styles, set fonts, and outline primary dark-slate gradients.

#### [MODIFY] [App.css](file:///c:/Users/mugil/Desktop/Projects/Others/NLP-Driven%20Personal%20Memory%20Assistant%20with%20Real-Time%20Alerts/frontend/src/App.css)
- Implement CSS variables for premium theme palette.
- Design glassmorphism panels, input fields, tables, dashboard stats cards, modals, empty states, and animations.
- Set responsive breakpoints for fluid layout on smaller screens.

#### [MODIFY] [App.jsx](file:///c:/Users/mugil/Desktop/Projects/Others/NLP-Driven%20Personal%20Memory%20Assistant%20with%20Real-Time%20Alerts/frontend/src/App.jsx)
- Update layout to a premium Dashboard with Statistics Cards.
- Integrate memory retrieval views (Today, Week, High Priority, Upcoming, Completed).
- Add support for conversational retrieval (if the NLP parsing result is a retrieval intent, switch the view accordingly).
- Synthesize crisp notification sound using the Web Audio API (offline-capable, zero dependencies).
- List triggered reminders in a "Notification History" section.
- Avoid duplicate notification triggers.

---

## Verification Plan

### Automated Tests
We will verify endpoints and NLP functionality:
- Run manual tests on the parser script by passing various sample texts.
- Test connection and responses using curl/Postman.

### Manual Verification
- Test natural language phrases: "buy milk tomorrow at 5pm", "important presentation next monday at 10am".
- Verify priority is correctly updated by Gemini (or fallback).
- Verify notifications trigger with audio, and high-priority alarms trigger emails.
- Verify status changes to TRIGGERED/MISSED.
- Check responsive styles on mobile viewports.
