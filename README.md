# 🧠 AI-Enhanced Personal Memory Assistant with Real-Time Alerts

A conversational, AI-driven cognitive extension application built with **React (Vite)**, **Node.js (Express)**, **MySQL**, and **Google Gemini API**. 

The assistant allows users to store, prioritize, categorize, and search reminders or memory nodes in natural conversation. It features a background cron job scheduler triggering native OS desktop notifications and rich HTML email alerts, as well as an interactive AI chat companion that dynamically translates conversational commands into database mutations.

---

## 🌟 Key Features

1. **AI-Driven NLP Semantic Parser (Gemini-First)**:
   - Processes raw, unstructured text (e.g. *"remind me to prepare slides in 45 minutes"*, *"pay credit card next friday at 10 am"*) using `gemini-2.5-flash`.
   - Extracts scheduling metadata: intent, clean title, target date (YYYY-MM-DD), target time (HH:MM:SS), recurrence rules, task priority, and category.
   - Automatically degrades to a local regex parser fallback (`parser.js`) if the Gemini API key is missing or calls fail, ensuring zero downtime.

2. **Conversational AI Chat Companion (Mini-Agent)**:
   - Features an immersive glassmorphic chat tab to speak directly with the memory assistant.
   - The assistant has real-time awareness of active database records.
   - Translates messages (e.g. *"schedule groceries today at 6 PM"*, *"delete task 5"*, or *"move my meeting to tomorrow"*) into structured database actions (`CREATE`, `UPDATE`, `DELETE`) which are instantly executed.

3. **Smart Categorization & Chips**:
   - Classifies memories dynamically into categories: **Work** 💼, **Personal** 🏠, **Health** 🩺, **Financial** 💰, and **Other** 🏷️.
   - Supports local category filtering chips in the UI dashboard.

4. **Robust Cron Scheduling Engine**:
   - Background worker (`cron.js`) runs every 60 seconds.
   - Implements a due-checking queue: triggers **any pending reminder that is due** (scheduled date/time is less than or equal to current time) instead of strictly matching the exact current minute.
   - Prevents reminders from being silently marked as missed when the server starts late; reminders are marked as `MISSED` only if they are more than 24 hours overdue.
   - Automatically calculates next occurrence dates and schedules recurring events (Daily, Weekly, Monthly).

5. **Multi-Channel Alerts**:
   - **OS Level Notifications**: Displays native desktop notifications with sound alerts (`node-notifier`).
   - **Email Notifications**: Dispatches responsive, styled HTML alerts to the user's Gmail using Nodemailer SMTP when high-priority memories trigger.
   - **In-App Audio Alerts**: Synthesizes custom retro chiptune chimes via Web Audio API when browser tabs are active.

6. **Premium UI Redesign**:
   - Modern dark slate theme featuring glowing glassmorphism panels, priority-colored side indicators, and category tags.
   - Fully replaced text-based emojis with professional, responsive vector inline SVG icons.

---

## 🛠️ System Architecture

The application follows a classic **Three-Tier Client-Server Architecture** augmented with an **AI service layer** and a background scheduler process.

```mermaid
graph TD
    subgraph Client Tier (Frontend)
        A[React SPA - Vite] -->|Web Audio API| B[Audio Chimes]
        A -->|Axios REST Requests| D[Express REST API]
    end

    subgraph Application Tier (Backend)
        D -->|Routes / Controllers| E[Memory & Reminder Controllers]
        E -->|NLP AI Service| F[geminiService.js]
        E -->|Rule Fallback Parser| G[parser.js]
        H[node-cron Scheduler] -->|Every 60s| I[Cron Engine]
        I -->|Desktop Alerts| J[node-notifier]
        I -->|HTML Email Service| K[Nodemailer SMTP]
    end

    subgraph Database Tier
        E -->|SQL Pool| L[(MySQL Database)]
        I -->|State Updates| L
    end
```

---

## 💾 Database Schema

The database table `reminders` is defined as follows:

```sql
CREATE TABLE IF NOT EXISTS reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NULL,
  description TEXT NULL,
  reminder_date DATE NULL,
  reminder_time TIME NULL,
  priority VARCHAR(20) DEFAULT 'NORMAL',
  status ENUM('PENDING', 'TRIGGERED', 'MISSED') DEFAULT 'PENDING',
  repeat_type ENUM('NONE', 'DAILY', 'WEEKLY', 'MONTHLY') DEFAULT 'NONE',
  category VARCHAR(50) DEFAULT 'Other',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

On server boot, `backend/config/migrate.js` runs automatically, checking the schema columns and running `ALTER TABLE` statements (e.g. adding the `category` column) to update older schemas without wiping existing records.

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MySQL Server running locally

### 1. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install server-side dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` root and configure the following environment variables:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=memory_assistant

   EMAIL_USER=your_gmail_address@gmail.com
   EMAIL_PASS=your_gmail_app_password
   EMAIL_TO=recipient_alert_email@gmail.com

   GEMINI_API_KEY=your_gemini_api_key
   ```
   *(Note: Ensure your Gemini API Key is obtained from Google AI Studio and Gmail requires setting up an App Password).*
4. Start the backend server:
   ```bash
   npm start
   ```
   *(The database migration will run automatically, and the server will listen on `http://localhost:5000`)*

### 2. Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the development build server:
   ```bash
   npm run dev
   ```
   *(The React UI will run locally on `http://localhost:5173/`)*

---

## 📡 API Reference Endpoints

### 1. Reminders CRUD API
- **`POST /api/reminders/add`**: Processes unstructured text inputs using AI/fallback. Automatically creates a pending database reminder or responds with a conversational search switch.
- **`GET /api/reminders`**: Fetches all active reminders ordered by schedule.
- **`PUT /api/reminders/:id`**: Supports partial modifications (title, priority, date, repeat rules, status, category).
- **`DELETE /api/reminders/:id`**: Removes a reminder.

### 2. Chat Companion Agent API
- **`POST /api/reminders/chat`**: Conversational chat interface. Accepts `{ message, history }`, queries active DB records, feeds context to Gemini, executes proposed DB actions (`CREATE`, `UPDATE`, `DELETE`), and returns the conversational answer.

### 3. Memory Retrieval Statistics API
- **`GET /api/memory/stats`**: Returns stats dashboard metrics (total count, pending, triggered, missed, high-priority).
- **`GET /api/memory/completed`**: Fetches the triggered history items logs.
- **`GET /api/memory/today`** / **`/week`** / **`/upcoming`** / **`/high-priority`**: Time/priority filtered listings.
