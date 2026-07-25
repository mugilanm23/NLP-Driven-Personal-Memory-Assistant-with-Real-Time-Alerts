/**
 * Pure Rule-Based NLP Parser Engine
 * Handles Text Cleaning, Tokenization, Stop Word Removal, Date Detection, 
 * Time Detection, Intent Detection, Title Extraction, and Recurrence Extraction.
 */

// List of filler words and prepositions to remove from titles
const FILLER_WORDS = [
  "remind me to",
  "remind me about",
  "remind me",
  "remind",
  "please",
  "kindly",
  "to",
  "about",
  "a",
  "an",
  "the",
  "me",
  "at",
  "on",
  "for"
];

// Map weekday names to index (0 = Sunday, 1 = Monday, ...)
const WEEKDAY_MAP = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

/**
 * 1. Text Cleaning: Lowers casing and removes excessive whitespace.
 */
function cleanText(text) {
  if (!text) return "";
  return text.trim().replace(/\s+/g, " ");
}

/**
 * 2. Tokenization: Splits text into tokens by spaces.
 */
function tokenize(text) {
  return text.split(/\s+/);
}

/**
 * Detects search/retrieval intent versus reminder creation intent.
 */
function detectIntent(text) {
  const lower = text.toLowerCase();

  // Search/Retrieve Patterns
  if (
    lower.includes("what reminders") ||
    lower.includes("show") ||
    lower.includes("get") ||
    lower.includes("list") ||
    lower.includes("retrieve")
  ) {
    if (lower.includes("today")) {
      return { intent: "RETRIEVE", type: "today" };
    }
    if (lower.includes("week")) {
      return { intent: "RETRIEVE", type: "week" };
    }
    if (lower.includes("high") || lower.includes("priority")) {
      return { intent: "RETRIEVE", type: "high-priority" };
    }
    if (lower.includes("upcoming") || lower.includes("pending")) {
      return { intent: "RETRIEVE", type: "upcoming" };
    }
    if (
      lower.includes("completed") ||
      lower.includes("done") ||
      lower.includes("triggered") ||
      lower.includes("history") ||
      lower.includes("missed")
    ) {
      return { intent: "RETRIEVE", type: "completed" };
    }
  }

  // Exact command triggers
  if (lower === "reminders today" || lower === "today's reminders") {
    return { intent: "RETRIEVE", type: "today" };
  }
  if (lower === "reminders this week" || lower === "weekly reminders") {
    return { intent: "RETRIEVE", type: "week" };
  }
  if (lower === "high priority" || lower === "high priority reminders") {
    return { intent: "RETRIEVE", type: "high-priority" };
  }
  if (lower === "upcoming" || lower === "upcoming reminders") {
    return { intent: "RETRIEVE", type: "upcoming" };
  }
  if (lower === "completed" || lower === "completed reminders" || lower === "history") {
    return { intent: "RETRIEVE", type: "completed" };
  }

  return { intent: "CREATE" };
}

/**
 * Detects recurrence/repeat type from text.
 * Support: DAILY, WEEKLY, MONTHLY
 */
function detectRepeatType(text) {
  const lower = text.toLowerCase();
  
  if (/\b(daily|every\s+day|each\s+day)\b/i.test(lower)) {
    return "DAILY";
  }
  if (/\b(weekly|every\s+week|each\s+week)\b/i.test(lower)) {
    return "WEEKLY";
  }
  if (/\b(monthly|every\s+month|each\s+month)\b/i.test(lower)) {
    return "MONTHLY";
  }
  return "NONE";
}

/**
 * Parses supported date phrases and returns the YYYY-MM-DD string.
 * Returns null if no phrase matches.
 */
function detectDate(text) {
  const lower = text.toLowerCase();
  const today = new Date();
  let targetDate = new Date();
  let matchedPhrase = null;

  // Ordered list of date phrases (longer patterns first to prevent partial matching)
  const phrases = [
    "day after tomorrow",
    "tomorrow",
    "today",
    "next week",
    "next monday",
    "next tuesday",
    "next wednesday",
    "next thursday",
    "next friday",
    "next saturday",
    "next sunday"
  ];

  for (const phrase of phrases) {
    const regex = new RegExp(`\\b${phrase}\\b`, "i");
    if (regex.test(lower)) {
      matchedPhrase = phrase;
      break;
    }
  }

  if (!matchedPhrase) return null;

  if (matchedPhrase === "today") {
    // targetDate is today
  } else if (matchedPhrase === "tomorrow") {
    targetDate.setDate(today.getDate() + 1);
  } else if (matchedPhrase === "day after tomorrow") {
    targetDate.setDate(today.getDate() + 2);
  } else if (matchedPhrase === "next week") {
    targetDate.setDate(today.getDate() + 7);
  } else if (matchedPhrase.startsWith("next ")) {
    const dayName = matchedPhrase.substring(5).trim();
    const targetDayIndex = WEEKDAY_MAP[dayName];
    const currentDayIndex = today.getDay();
    
    let diff = targetDayIndex - currentDayIndex;
    if (diff <= 0) {
      diff += 7; // Advance to next week's day
    }
    targetDate.setDate(today.getDate() + diff);
  }

  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
  const dd = String(targetDate.getDate()).padStart(2, "0");

  return {
    dateStr: `${yyyy}-${mm}-${dd}`,
    matchedText: matchedPhrase
  };
}

/**
 * Parses supported time formats and returns the HH:MM:00 string.
 * Returns null if no time format matches.
 */
function detectTime(text) {
  const lower = text.toLowerCase();
  let hour = null;
  let minute = 0;
  let matchedText = null;

  // Format 1: 12-hour AM/PM formats (e.g., "5 pm", "5pm", "10:30 am", "10am")
  const ampmRegex = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/gi;
  const ampmMatch = ampmRegex.exec(lower);

  if (ampmMatch) {
    hour = parseInt(ampmMatch[1], 10);
    if (ampmMatch[2]) {
      minute = parseInt(ampmMatch[2], 10);
    }
    const period = ampmMatch[3].toLowerCase();
    
    if (period === "pm" && hour < 12) {
      hour += 12;
    } else if (period === "am" && hour === 12) {
      hour = 0;
    }
    matchedText = ampmMatch[0];
  } else {
    // Format 2: 24-hour military format (e.g., "18:00")
    const milRegex = /\b(\d{2}):(\d{2})\b/gi;
    const milMatch = milRegex.exec(lower);
    if (milMatch) {
      hour = parseInt(milMatch[1], 10);
      minute = parseInt(milMatch[2], 10);
      matchedText = milMatch[0];
    }
  }

  if (hour === null) return null;

  // Validate values
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");

  return {
    timeStr: `${hh}:${mm}:00`,
    matchedText
  };
}

/**
 * 3. Stop Word & Filler Removal: Removes filler phrases and cleans the output title.
 */
function cleanTitle(titleText) {
  let cleaned = titleText;

  // Sort filler phrases by length descending to match longer ones first ("remind me to" before "me")
  const sortedFillers = [...FILLER_WORDS].sort((a, b) => b.length - a.length);

  // Remove filler words/phrases case-insensitively using word boundaries
  for (const filler of sortedFillers) {
    const regex = new RegExp(`\\b${filler}\\b`, "gi");
    cleaned = cleaned.replace(regex, "");
  }

  // Strip leading/trailing punctuation commonly left over
  cleaned = cleaned.replace(/^[\s:,\-–—|.]+/, "");
  cleaned = cleaned.replace(/[\s:,\-–—|.]+$/, "");

  // Collapse multiple spaces
  cleaned = cleaned.trim().replace(/\s+/g, " ");

  // Capitalize first letter for visual excellence
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned || "Untitled Memory";
}

/**
 * Main parser entry function.
 * Tokenizes, cleans, detects intent, extracts date, time, repeat type, and cleans title.
 */
function parseText(input) {
  if (!input || !input.trim()) {
    return { error: "Input text cannot be empty" };
  }

  const cleanedInput = cleanText(input);

  // 1. Detect Intent
  const intentInfo = detectIntent(cleanedInput);
  if (intentInfo.intent === "RETRIEVE") {
    return {
      intent: "RETRIEVE",
      type: intentInfo.type
    };
  }

  // 2. Extract Date & Time
  const dateResult = detectDate(cleanedInput);
  const timeResult = detectTime(cleanedInput);
  const repeatType = detectRepeatType(cleanedInput);

  // Determine date value (default: today)
  let date = null;
  if (dateResult) {
    date = dateResult.dateStr;
  } else {
    // If no date specified but time is specified, default to today or tomorrow
    const todayStr = new Date().toISOString().split("T")[0];
    date = todayStr;
  }

  // Determine time value (default: 09:00:00)
  let time = "09:00:00";
  if (timeResult) {
    time = timeResult.timeStr;
  }

  // If time was specified but date was not, and the calculated target is in the past, push to tomorrow!
  if (!dateResult && timeResult) {
    const now = new Date();
    const target = new Date(`${date}T${time}`);
    if (target < now) {
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
      const dd = String(tomorrow.getDate()).padStart(2, "0");
      date = `${yyyy}-${mm}-${dd}`;
    }
  }

  // 3. Title Extraction (Remove date/time phrases and clean fillers)
  let remainingText = cleanedInput;
  if (dateResult) {
    // Replace the specific case-insensitive matched date phrase
    const dateRegex = new RegExp(`\\b${dateResult.matchedText}\\b`, "i");
    remainingText = remainingText.replace(dateRegex, "");
  }
  if (timeResult) {
    // Replace the specific case-insensitive matched time phrase
    const timeRegex = new RegExp(`\\b${timeResult.matchedText}\\b`, "i");
    remainingText = remainingText.replace(timeRegex, "");
  }

  // Also remove recurrence patterns from the title to keep it clean
  remainingText = remainingText.replace(/\b(daily|every\s+day|each\s+day|weekly|every\s+week|each\s+week|monthly|every\s+month|each\s+month)\b/gi, "");

  const title = cleanTitle(remainingText);

  return {
    intent: "CREATE",
    title,
    date,
    time,
    repeatType
  };
}

module.exports = {
  parseText,
  cleanText,
  tokenize,
  detectIntent,
  detectDate,
  detectTime,
  cleanTitle,
  detectRepeatType
};