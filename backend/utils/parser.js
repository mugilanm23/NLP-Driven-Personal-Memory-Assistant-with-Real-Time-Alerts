const chrono = require("chrono-node");

function parseText(input) {
    const priority = detectPriority(input);
  const results = chrono.parse(input);

  if (!results.length) {
    return { error: "Could not detect date/time" };
  }

  const parsedDate = results[0].start.date();

  // Extract date & time
  const date = parsedDate.toISOString().split("T")[0];
  const time = parsedDate.toTimeString().split(" ")[0];

  // Remove detected date part from input → remaining is title
  const textWithoutDate = input.replace(results[0].text, "").trim();

  let title = textWithoutDate || "Untitled Reminder";

return { title, date, time, priority };
}
function detectPriority(input) {
  const keywords = ["important", "imp", "urgent", "asap"];

  const lower = input.toLowerCase();

  for (let word of keywords) {
    if (lower.includes(word)) {
      return "HIGH";
    }
  }

  return "NORMAL";
}
module.exports = { parseText };