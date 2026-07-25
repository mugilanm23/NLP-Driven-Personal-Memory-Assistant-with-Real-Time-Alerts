const { GoogleGenerativeAI } = require("@google/generative-ai");
const parser = require("../utils/parser"); // Local rule-based parser fallback

/**
 * Predict priority using rule-based keywords as a fallback.
 */
function getFallbackPriority(title) {
  const highKeywords = ["urgent", "important", "critical", "deadline", "exam", "submission", "interview", "emergency"];
  const lowerTitle = (title || "").toLowerCase();
  
  for (const keyword of highKeywords) {
    if (lowerTitle.includes(keyword)) {
      return "HIGH";
    }
  }
  return "NORMAL";
}

/**
 * Smart Priority Prediction Service using Gemini API.
 * (Maintained for backward compatibility)
 */
async function predictPriority(title) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_api_key_here") {
    return getFallbackPriority(title);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a professional task priority classifier.
Evaluate the importance of the task title below and classify it into one of these priority levels:
- LOW
- NORMAL
- HIGH

Task Title: "${title}"

Return ONLY one of these three words: LOW, NORMAL, or HIGH. Do NOT include any explanations, markdown code blocks, punctuation, or surrounding text.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().toUpperCase();

    if (["LOW", "NORMAL", "HIGH"].includes(text)) {
      return text;
    } else {
      return getFallbackPriority(title);
    }
  } catch (error) {
    console.error("❌ Gemini API Priority Prediction failed:", error.message);
    return getFallbackPriority(title);
  }
}

/**
 * Smart AI Parser using Gemini API.
 * Extracts intent, title, date, time, repeatType, priority, and category in a single prompt.
 */
async function parseTextWithAI(text, localTimeContext) {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback to rule-based parser if API key is missing
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_api_key_here") {
    console.log("⚠️ GEMINI_API_KEY not set. Falling back to rule-based NLP parser.");
    const ruleParsed = parser.parseText(text);
    if (ruleParsed.error) return ruleParsed;

    const fallbackPriority = getFallbackPriority(ruleParsed.title);
    return {
      intent: ruleParsed.intent,
      type: ruleParsed.type || null,
      title: ruleParsed.title || "",
      date: ruleParsed.date || null,
      time: ruleParsed.time || null,
      repeatType: ruleParsed.repeatType || "NONE",
      priority: fallbackPriority,
      category: "Other" // default rule-based fallback category
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are a precise Natural Language Processing (NLP) metadata extractor for a Personal Memory Assistant.
Analyze the user's input text and extract scheduling metadata relative to the current reference time:
- Reference Date: ${localTimeContext.dateStr}
- Reference Time: ${localTimeContext.timeStr}
- Reference Weekday: ${localTimeContext.weekday}

Determine:
1. "intent": Whether the user wants to CREATE a reminder/memory (e.g., "remind me to...", "buy milk tomorrow", "dentist appointment next Friday at 4pm") or RETRIEVE memories (e.g., "list reminders for today", "show high priority memories", "upcoming reminders").
   - Allowed values: "CREATE" or "RETRIEVE".
2. "type": If intent is "RETRIEVE", classify the query type:
   - "today": reminders scheduled for today.
   - "week": reminders scheduled for this week (next 7 days).
   - "high-priority": reminders with priority = "HIGH".
   - "upcoming": active pending reminders scheduled in the future.
   - "completed": already triggered/completed reminders.
   - If not a retrieval, or doesn't match these categories, omit or set to null.
3. "title": If intent is "CREATE", extract the clean, concise title of the task. Keep it brief and strip out conversational filler words ("remind me to", "please", "at", "on", "for") and the date/time words. Capitalize the first letter. E.g., "remind me to buy milk tomorrow at 5pm" -> "Buy milk".
4. "date": If intent is "CREATE", extract the date in "YYYY-MM-DD" format.
   - Parse relative references accurately based on the Reference Date/Time/Weekday. For example:
     - "tomorrow": Reference Date + 1 day
     - "day after tomorrow": Reference Date + 2 days
     - "next friday": the upcoming Friday date.
     - "next week": Reference Date + 7 days.
     - "in 2 hours": Reference Date (or tomorrow if the time wraps past midnight).
     - If no date is specified, use the Reference Date (today).
5. "time": If intent is "CREATE", extract the time in "HH:MM:SS" format.
   - Parse relative references or explicit hours (e.g., "5 PM" -> "17:00:00", "8:30 am" -> "08:30:00").
   - "in 2 hours": current time + 2 hours.
   - "in 45 minutes": current time + 45 minutes.
   - If no time is specified, default to "09:00:00".
6. "repeatType": If intent is "CREATE", identify recurrence patterns:
   - "NONE"
   - "DAILY" (e.g., "every day", "each day", "daily")
   - "WEEKLY" (e.g., "every week", "weekly")
   - "MONTHLY" (e.g., "every month", "monthly")
7. "priority": Determine task priority:
   - "HIGH" (if task contains urgent words like "urgent", "important", "critical", "deadline", "exam", "submission", "interview", "emergency" or indicates severe consequences if missed)
   - "LOW" (for trivial tasks like "watch movie", "relax", "play games")
   - "NORMAL" (default fallback)
8. "category": Classify the task into a category:
   - "Work" (meetings, emails, code, projects)
   - "Personal" (calls to family, errands, laundry, gym)
   - "Health" (medicine, doctor appointments, exercise)
   - "Financial" (rent, utility bills, fees, taxes)
   - "Other" (default if not fitting above)

Return a valid JSON object matching this schema:
{
  "intent": "CREATE" | "RETRIEVE",
  "type": "today" | "week" | "high-priority" | "upcoming" | "completed" | null,
  "title": string,
  "date": "YYYY-MM-DD",
  "time": "HH:MM:SS",
  "repeatType": "NONE" | "DAILY" | "WEEKLY" | "MONTHLY",
  "priority": "LOW" | "NORMAL" | "HIGH",
  "category": "Work" | "Personal" | "Health" | "Financial" | "Other"
}

Input: "${text}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    const parsedData = JSON.parse(responseText);

    // Schema Validation & Clean fallback checks
    if (!parsedData.intent) parsedData.intent = "CREATE";
    if (parsedData.intent === "CREATE") {
      if (!parsedData.title) parsedData.title = text.substring(0, 50);
      if (!parsedData.date) parsedData.date = localTimeContext.dateStr;
      if (!parsedData.time) parsedData.time = "09:00:00";
      if (!["LOW", "NORMAL", "HIGH"].includes(parsedData.priority)) parsedData.priority = "NORMAL";
      if (!["NONE", "DAILY", "WEEKLY", "MONTHLY"].includes(parsedData.repeatType)) parsedData.repeatType = "NONE";
      if (!["Work", "Personal", "Health", "Financial", "Other"].includes(parsedData.category)) parsedData.category = "Other";
    }

    return parsedData;
  } catch (error) {
    console.error("❌ Gemini API NLP Parser failed, falling back to rule-based:", error);
    const ruleParsed = parser.parseText(text);
    if (ruleParsed.error) return ruleParsed;

    const fallbackPriority = getFallbackPriority(ruleParsed.title);
    return {
      intent: ruleParsed.intent,
      type: ruleParsed.type || null,
      title: ruleParsed.title || "",
      date: ruleParsed.date || null,
      time: ruleParsed.time || null,
      repeatType: ruleParsed.repeatType || "NONE",
      priority: fallbackPriority,
      category: "Other"
    };
  }
}

/**
 * Chat with Gemini Agent.
 * Interprets messages, summarizes active reminders, and suggests CRUD actions.
 */
async function chatWithAI(message, chatHistory, activeReminders, localTimeContext) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_api_key_here") {
    return {
      reply: "⚠️ **Gemini API Key not configured.** Conversational AI Chat is currently disabled. You can still create and search reminders using the standard text input above, which falls back to local rule-based parsing.",
      action: null
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const cleanReminders = activeReminders.map(r => ({
      id: r.id,
      title: r.title,
      date: typeof r.reminder_date === "string" ? r.reminder_date.split("T")[0] : r.reminder_date,
      time: r.reminder_time,
      priority: r.priority,
      status: r.status,
      repeat_type: r.repeat_type,
      category: r.category
    }));

    const systemPrompt = `You are a helpful, conversational, and highly efficient Personal Memory Assistant.
The user is conversing with you. You have access to their current list of scheduled reminders:
${JSON.stringify(cleanReminders)}

Current Reference Time details:
- Reference Date: ${localTimeContext.dateStr}
- Reference Time: ${localTimeContext.timeStr}
- Reference Weekday: ${localTimeContext.weekday}

Your role is to:
1. Respond conversationally, concisely, and clearly. You can answer questions, summarize tasks, list reminders, and explain what is coming up.
2. If the user asks you to manage their reminders (e.g. create a task, delete a task, change a date), you should propose a structured "action" in your JSON payload. The backend will execute it.
   - For CREATE action:
     "action": {
        "type": "CREATE",
        "data": {
           "title": "Clean title",
           "date": "YYYY-MM-DD",
           "time": "HH:MM:SS",
           "repeatType": "NONE" | "DAILY" | "WEEKLY" | "MONTHLY",
           "priority": "LOW" | "NORMAL" | "HIGH",
           "category": "Work" | "Personal" | "Health" | "Financial" | "Other"
        }
     }
     Calculate the date and time values relative to the current Reference Time.
   - For DELETE action:
     If the user wants to delete a task (e.g., "delete my dentist appointment"), find the matching reminder in their current reminders list. Get its id, and return:
     "action": {
        "type": "DELETE",
        "id": [reminder_id]
     }
   - For UPDATE action:
     If the user wants to modify a task (e.g., "move my exam reminder to Friday"), find the matching reminder id and specify the new field updates:
     "action": {
        "type": "UPDATE",
        "id": [reminder_id],
        "data": {
           "title": string (optional),
           "reminder_date": "YYYY-MM-DD" (optional),
           "reminder_time": "HH:MM:SS" (optional),
           "priority": "LOW"|"NORMAL"|"HIGH" (optional),
           "status": "PENDING"|"TRIGGERED"|"MISSED" (optional),
           "repeat_type": "NONE"|"DAILY"|"WEEKLY"|"MONTHLY" (optional),
           "category": "Work"|"Personal"|"Health"|"Financial"|"Other" (optional)
        }
     }
   - If no database action is required (conversational or queries like "what reminders do I have today?"), set "action" to null. You will describe the answer in "reply" instead.

Provide your output in this JSON format:
{
  "reply": "Conversational markdown text responding to the user. E.g. 'You have 3 reminders today. The most urgent is...' or 'Sure, I will add that task for you.'",
  "action": { ... } or null
}

Chat History for context:
${JSON.stringify(chatHistory.slice(-6))}

User's new message: "${message}"`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text().trim();
    const parsedData = JSON.parse(responseText);

    return parsedData;
  } catch (error) {
    console.error("❌ Gemini Chat AI Service Error:", error);
    return {
      reply: "❌ Sorry, I encountered an error while processing your request. Please check the backend logs.",
      action: null
    };
  }
}

module.exports = {
  predictPriority,
  getFallbackPriority,
  parseTextWithAI,
  chatWithAI
};
