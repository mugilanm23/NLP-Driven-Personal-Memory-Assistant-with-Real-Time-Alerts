import { useEffect, useState } from "react";
import axios from "axios";

// 🌍 Backend API base URL (uses local development port 5000 as default)
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// 🎨 Professional SVG Icon Components (Lightweight & CSS theme compatible)
const EditIcon = ({ size = 16, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
);
const TrashIcon = ({ size = 16, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);
const BriefcaseIcon = ({ size = 16, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
);
const HomeIcon = ({ size = 16, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const HeartIcon = ({ size = 16, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);
const FinancialIcon = ({ size = 16, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);
const TagIcon = ({ size = 16, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l7.29-7.29a1 1 0 0 0 0-1.41L12 2z"/><path d="m6 6 .01-.01"/></svg>
);
const SearchIcon = ({ size = 16, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const CalendarIcon = ({ size = 16, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);
const ClockIcon = ({ size = 16, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const BellIcon = ({ size = 16, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
);
const SendIcon = ({ size = 16, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
);
const BotIcon = ({ size = 16, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
);
const SparklesIcon = ({ size = 16, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);
const FlameIcon = ({ size = 16, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
);
const CheckIcon = ({ size = 16, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const HourglassIcon = ({ size = 16, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 2h14"/><path d="M5 22h14"/><path d="M19 2v4c0 2-2 4-5 5v2c3 1 5 3 5 5v4"/><path d="M5 2v4c0 2 2 4 5 5v2c-3 1-5 3-5 5v4"/></svg>
);
const FolderIcon = ({ size = 16, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/></svg>
);
const AlertCircleIcon = ({ size = 16, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);
const UserIcon = ({ size = 16, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const BrainIcon = ({ size = 24, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-4.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-4.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2Z"/></svg>
);

function App() {
  const [text, setText] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'today', 'week', 'high-priority', 'upcoming', 'completed'
  const [selectedCategory, setSelectedCategory] = useState("All"); // 'All', 'Work', 'Personal', 'Health', 'Financial', 'Other'
  const [reminders, setReminders] = useState([]);
  const [localHistory, setLocalHistory] = useState([]);
  const [notifiedIds, setNotifiedIds] = useState(new Set());
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // View tabs state: 'dashboard' or 'chat'
  const [activeTab, setActiveTab] = useState("dashboard");

  // AI Chat Assistant state
  const [chatHistory, setChatHistory] = useState([
    { 
      sender: "assistant", 
      text: "Hello! I am your AI Personal Memory Assistant. I can help you schedule reminders, search, update, or delete them in natural language. Try saying: 'Add a high priority task to review project code tomorrow at 2 PM' or 'List my health tasks'." 
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Statistics counters state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    triggered: 0,
    missed: 0,
    highPriority: 0
  });

  // Modal states for editing
  const [editData, setEditData] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editPriority, setEditPriority] = useState("NORMAL");
  const [editStatus, setEditStatus] = useState("PENDING");
  const [editRepeat, setEditRepeat] = useState("NONE");
  const [editCategory, setEditCategory] = useState("Other");

  // Load notified IDs from localStorage to prevent re-alerting on browser refreshes
  useEffect(() => {
    const saved = localStorage.getItem("notified_memory_ids");
    if (saved) {
      try {
        setNotifiedIds(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("Error loading notification cache", e);
      }
    }
    
    // Request permission for browser push notifications
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Synthesize a professional chiptune chime sound using Web Audio API (zero dependencies)
  const playChimeSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      
      // Note 1 (E5)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);
      
      // Note 2 (A5)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880.00, now + 0.08);
      gain2.gain.setValueAtTime(0.08, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.5);
    } catch (err) {
      console.warn("Could not play synthesized audio alert:", err);
    }
  };

  // Show browser push notification
  const triggerPushNotification = (title, priority) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const isHigh = priority === "HIGH";
      new Notification(isHigh ? "🚨 High Priority Memory Alert" : "🔔 Memory Reminder", {
        body: title,
        icon: "https://cdn-icons-png.flaticon.com/512/1827/1827392.png"
      });
      playChimeSound();
    } else {
      // Fallback sound if browser notifications blocked
      playChimeSound();
    }
  };

  // Check list of reminders for newly triggered events
  const checkForAlerts = (list) => {
    const now = new Date();
    let updated = false;
    const nextNotified = new Set(notifiedIds);

    list.forEach(r => {
      if (r.status === "TRIGGERED" && !nextNotified.has(r.id)) {
        // Safe formatting of reminder_date
        let dateStr = "";
        if (typeof r.reminder_date === "string") {
          dateStr = r.reminder_date.split("T")[0];
        } else if (r.reminder_date) {
          const d = new Date(r.reminder_date);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          dateStr = `${yyyy}-${mm}-${dd}`;
        }

        const reminderTime = new Date(`${dateStr}T${r.reminder_time}`);
        const diffMinutes = (now - reminderTime) / (1000 * 60);

        if (diffMinutes >= -1 && diffMinutes <= 5) {
          triggerPushNotification(r.title, r.priority);
        }
        
        nextNotified.add(r.id);
        updated = true;
      }
    });

    if (updated) {
      setNotifiedIds(nextNotified);
      localStorage.setItem("notified_memory_ids", JSON.stringify(Array.from(nextNotified)));
    }
  };

  // Synchronize statistics, notification history, and active list
  const syncDashboard = async (filter = activeFilter) => {
    try {
      // 1. Fetch Stats
      const statsRes = await axios.get(`${API_BASE}/memory/stats`);
      setStats(statsRes.data);

      // 2. Fetch Notification History (Triggered events)
      const historyRes = await axios.get(`${API_BASE}/memory/completed`);
      setLocalHistory(historyRes.data.slice(0, 10)); // Limit to 10 most recent

      // 3. Fetch Display List
      let displayRes;
      if (filter === "all") {
        displayRes = await axios.get(`${API_BASE}/reminders`);
      } else {
        displayRes = await axios.get(`${API_BASE}/memory/${filter}`);
      }
      setReminders(displayRes.data);

      // 4. Check for alerts in database
      const checkRes = await axios.get(`${API_BASE}/reminders`);
      checkForAlerts(checkRes.data);
    } catch (err) {
      console.error("Dashboard synchronization error:", err);
    }
  };

  // Background polling loop (every 20 seconds) for real-time status and alerts update
  useEffect(() => {
    syncDashboard();

    const interval = setInterval(() => {
      syncDashboard();
    }, 20000);

    return () => clearInterval(interval);
  }, [activeFilter]);

  // Handle addition of new reminder / processing natural language search query
  const handleAddMemory = async () => {
    if (!text.trim()) {
      alert("Please write something for the Memory Assistant to parse.");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/reminders/add`, { text });
      const result = response.data;
      setText("");

      if (result.isQuery) {
        // Conversational query search matched! Update active filter view.
        setActiveFilter(result.queryType);
        setReminders(result.data);
        
        // Show brief visual confirmation
        setFeedbackMsg(`🔍 Switched view to "${result.queryType.toUpperCase()}" based on your search!`);
        setTimeout(() => setFeedbackMsg(null), 4000);
      } else {
        // Added new memory node successfully!
        setFeedbackMsg(`✅ Stored memory: "${result.data.title}" (${result.data.priority} Priority, ${result.data.category} Category)`);
        setTimeout(() => setFeedbackMsg(null), 4000);
        syncDashboard();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to process your input");
    }
  };

  // Send message to the Conversational Chat Companion
  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput("");

    // Add user message to history
    const updatedHistory = [...chatHistory, { sender: "user", text: userMessage }];
    setChatHistory(updatedHistory);
    setIsChatTyping(true);

    try {
      const response = await axios.post(`${API_BASE}/reminders/chat`, {
        message: userMessage,
        history: updatedHistory.map(h => ({ sender: h.sender, text: h.text }))
      });

      const { reply, actionResult, reminders: newReminders } = response.data;

      // Add assistant response to history
      setChatHistory(prev => [...prev, { sender: "assistant", text: reply }]);

      if (actionResult && actionResult.success) {
        setFeedbackMsg(`⚡ AI Action: ${actionResult.message}`);
        setTimeout(() => setFeedbackMsg(null), 4000);
      }

      if (newReminders) {
        setReminders(newReminders);
        // Refresh dashboard statistics
        const statsRes = await axios.get(`${API_BASE}/memory/stats`);
        setStats(statsRes.data);
        const historyRes = await axios.get(`${API_BASE}/memory/completed`);
        setLocalHistory(historyRes.data.slice(0, 10));
      } else {
        syncDashboard();
      }
    } catch (err) {
      console.error("Chat error:", err);
      setChatHistory(prev => [
        ...prev, 
        { sender: "assistant", text: "❌ Failed to reach the assistant. Check that the server is running and your GEMINI_API_KEY is configured in the `.env` file." }
      ]);
    } finally {
      setIsChatTyping(false);
    }
  };

  // Delete memory node
  const handleDeleteMemory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this memory item?")) return;
    try {
      await axios.delete(`${API_BASE}/reminders/${id}`);
      syncDashboard();
    } catch (err) {
      console.error("Error deleting memory:", err);
    }
  };

  // Open Edit Modal with preloaded details
  const openEditModal = (r) => {
    setEditData(r);
    setEditTitle(r.title);
    
    // Format date string from database (YYYY-MM-DD)
    let formattedDate = "";
    if (typeof r.reminder_date === "string") {
      formattedDate = r.reminder_date.split("T")[0];
    } else if (r.reminder_date) {
      const d = new Date(r.reminder_date);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      formattedDate = `${yyyy}-${mm}-${dd}`;
    }
    setEditDate(formattedDate);
    
    // Slice off seconds for time input compatibility (HH:MM)
    setEditTime(r.reminder_time.slice(0, 5));
    setEditPriority(r.priority);
    setEditStatus(r.status);
    setEditRepeat(r.repeat_type || "NONE");
    setEditCategory(r.category || "Other");
  };

  // Update memory details on submission
  const handleUpdateMemory = async () => {
    if (!editTitle.trim()) {
      alert("Title cannot be empty");
      return;
    }

    try {
      await axios.put(`${API_BASE}/reminders/${editData.id}`, {
        title: editTitle,
        reminder_date: editDate,
        reminder_time: `${editTime}:00`,
        priority: editPriority,
        status: editStatus,
        repeat_type: editRepeat,
        category: editCategory
      });

      setEditData(null);
      syncDashboard();
    } catch (err) {
      console.error("Error updating memory:", err);
      alert("Failed to update memory.");
    }
  };

  // Formatting utilities
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    let d;
    if (typeof dateStr === "string") {
      const cleanStr = dateStr.split("T")[0];
      d = new Date(cleanStr);
    } else {
      d = new Date(dateStr);
    }
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const timeParts = timeStr.split(":");
    const dummyDate = new Date();
    dummyDate.setHours(parseInt(timeParts[0], 10));
    dummyDate.setMinutes(parseInt(timeParts[1], 10));
    return dummyDate.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const getCategoryEmoji = (category, size = 16) => {
    switch (category?.toLowerCase()) {
      case "work": return <BriefcaseIcon size={size} className="icon-inline" />;
      case "personal": return <HomeIcon size={size} className="icon-inline" />;
      case "health": return <HeartIcon size={size} className="icon-inline" />;
      case "financial": return <FinancialIcon size={size} className="icon-inline" />;
      default: return <TagIcon size={size} className="icon-inline" />;
    }
  };

  const getCategoryIcon = (cat, size = 14) => {
    switch (cat?.toLowerCase()) {
      case "all": return <FolderIcon size={size} className="icon-inline" />;
      case "work": return <BriefcaseIcon size={size} className="icon-inline" />;
      case "personal": return <HomeIcon size={size} className="icon-inline" />;
      case "health": return <HeartIcon size={size} className="icon-inline" />;
      case "financial": return <FinancialIcon size={size} className="icon-inline" />;
      default: return <TagIcon size={size} className="icon-inline" />;
    }
  };

  const getTabIcon = (tabId, size = 14) => {
    switch (tabId) {
      case "all": return <FolderIcon size={size} className="icon-inline" />;
      case "today": return <CalendarIcon size={size} className="icon-inline" />;
      case "week": return <CalendarIcon size={size} className="icon-inline" />;
      case "high-priority": return <FlameIcon size={size} className="icon-inline" style={{ color: "var(--priority-high)" }} />;
      case "upcoming": return <HourglassIcon size={size} className="icon-inline" />;
      case "completed": return <CheckIcon size={size} className="icon-inline" />;
      default: return <FolderIcon size={size} className="icon-inline" />;
    }
  };

  // Filter memories based on active filter and category selection
  const filteredReminders = reminders.filter(r => {
    if (selectedCategory === "All") return true;
    return (r.category || "Other").toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="app-container">
      {/* 🚀 Header */}
      <header className="app-header">
        <h1 className="app-title">AI-Enhanced Personal Memory Assistant</h1>
        <p className="app-subtitle">Store, manage, and recall memories with NLP Semantic Parsing & Interactive AI Chat</p>
      </header>

      {/* ⚙️ Toggle View Tabs */}
      <div className="view-selector-tabs">
        <button 
          className={`view-selector-btn ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          <FolderIcon size={14} className="icon-inline" />
          Dashboard View
        </button>
        <button 
          className={`view-selector-btn ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          <BotIcon size={14} className="icon-inline" />
          AI Chat Companion
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === "dashboard" ? (
        <>
          {/* 📊 Dashboard Statistics Grid */}
          <section className="stats-grid">
            <div className="stat-card total">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Memories</span>
            </div>
            <div className="stat-card pending">
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-card triggered">
              <span className="stat-value">{stats.triggered}</span>
              <span className="stat-label">Triggered</span>
            </div>
            <div className="stat-card missed">
              <span className="stat-value">{stats.missed}</span>
              <span className="stat-label">Missed</span>
            </div>
            <div className="stat-card high">
              <span className="stat-value">{stats.highPriority}</span>
              <span className="stat-label">High Priority</span>
            </div>
          </section>

          {/* ⚙️ Filtering Tabs (Time / Priority status) */}
          <nav className="filter-tabs">
            {["all", "today", "week", "high-priority", "upcoming", "completed"].map(filterKey => {
              const labelMap = {
                "all": "All Memories",
                "today": "Today",
                "week": "This Week",
                "high-priority": "High Priority",
                "upcoming": "Upcoming",
                "completed": "Triggered"
              };
              const mappedKey = filterKey === "high-priority" ? "high-priority" : filterKey;
              return (
                <button 
                  key={filterKey}
                  id={`filter-${filterKey}`}
                  className={`filter-btn ${activeFilter === mappedKey ? "active" : ""}`}
                  onClick={() => { setActiveFilter(mappedKey); if(mappedKey === "all") setSelectedCategory("All"); }}
                >
                  {getTabIcon(filterKey)}
                  {labelMap[filterKey]}
                </button>
              );
            })}
          </nav>

          {/* 🏷️ Category Filter Chips */}
          <section className="category-chips-section">
            <span className="category-chips-label">Filter Category:</span>
            <div className="category-chips">
              {["All", "Work", "Personal", "Health", "Financial", "Other"].map(cat => (
                <button
                  key={cat}
                  className={`category-chip ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {getCategoryIcon(cat)}
                  <span className="chip-text">{cat}</span>
                </button>
              ))}
            </div>
          </section>

          {/* 🔗 Two Column Split: Memory List + Notifications History Panel */}
          <main className="dashboard-layout">
            
            {/* Left column: Memory List */}
            <section className="section-panel">
              <div className="section-header-row">
                <h2 className="section-title">
                  <BellIcon size={20} style={{ color: "var(--color-accent)", marginRight: "6px" }} />
                  <span>Active Memory Nodes</span> 
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500", marginLeft: "8px" }}>
                    ({filteredReminders.length} displayed)
                  </span>
                </h2>
              </div>

              <div className="memory-list">
                {filteredReminders.length === 0 ? (
                  <div className="empty-state">
                    <BrainIcon size={44} className="empty-icon" />
                    <p>No active memories found in this category.</p>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Type a prompt above or switch categories to view.
                    </p>
                  </div>
                ) : (
                  filteredReminders.map((r) => (
                    <article className="memory-card" key={r.id}>
                      {/* Left side indicator boundary */}
                      <div className={`priority-strip ${r.priority}`} />

                      <div className="memory-details">
                        <div className="memory-card-title-row">
                          <h3 className="memory-title">{r.title}</h3>
                          <span className={`badge-priority ${r.priority}`}>
                            {r.priority}
                          </span>
                          <span className="badge-category">
                            {getCategoryEmoji(r.category)} 
                            <span>{r.category || "Other"}</span>
                          </span>
                          {r.repeat_type && r.repeat_type !== "NONE" && (
                            <span className="badge-recurrence">
                              <span>🔄</span>
                              <span>{r.repeat_type}</span>
                            </span>
                          )}
                          <span className={`status-indicator ${r.status}`}>
                            <span className={`status-dot ${r.status}`} />
                            {r.status}
                          </span>
                        </div>

                        <div className="memory-time-row">
                          <span className="time-item">
                            <CalendarIcon size={14} className="icon-inline" />
                            <span>{formatDate(r.reminder_date)}</span>
                          </span>
                          <span className="time-item">
                            <ClockIcon size={14} className="icon-inline" />
                            <span>{formatTime(r.reminder_time)}</span>
                          </span>
                        </div>
                      </div>

                      <div className="memory-actions">
                        <button 
                          className="btn-icon" 
                          onClick={() => openEditModal(r)}
                          title="Edit Memory Node"
                        >
                          <EditIcon size={16} />
                        </button>
                        <button 
                          className="btn-icon delete" 
                          onClick={() => handleDeleteMemory(r.id)}
                          title="Delete Memory Node"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            {/* Right column: Notification Alerts History panel */}
            <aside className="section-panel">
              <h2 className="section-title">
                <AlertCircleIcon size={20} style={{ color: "#f87171", marginRight: "6px" }} />
                <span>Alert Log History</span>
              </h2>
              
              <div className="notification-history">
                {localHistory.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "20px 0" }}>
                    No notifications logged yet.
                  </p>
                ) : (
                  <div className="history-list">
                    {localHistory.map((h) => (
                      <div className="history-item" key={h.id}>
                        <div className="history-title">{h.title}</div>
                        <div className="history-meta">
                          <span>{formatDate(h.reminder_date)}</span>
                          <span>{formatTime(h.reminder_time)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>

          </main>
        </>
      ) : (
        /* AI Chat Companion Interface */
        <section className="chat-layout">
          {/* Chat Sidebar: Live update list of current reminders */}
          <aside className="chat-sidebar">
            <h3 className="sidebar-title">
              <BellIcon size={16} className="icon-inline" style={{ color: "var(--color-accent)", marginRight: "6px" }} />
              Current Reminders ({reminders.length})
            </h3>
            <div className="sidebar-list">
              {reminders.length === 0 ? (
                <div className="sidebar-empty">
                  <BrainIcon size={32} />
                  <p>No active reminders stored.</p>
                </div>
              ) : (
                reminders.map(r => (
                  <div key={r.id} className={`sidebar-item ${r.priority}`}>
                    <div className="sidebar-item-header">
                      <span className="sidebar-item-title">{r.title}</span>
                      <span className="sidebar-item-category" title={r.category}>
                        {getCategoryEmoji(r.category, 14)}
                      </span>
                    </div>
                    <div className="sidebar-item-meta">
                      <span className={`badge-priority mini ${r.priority}`}>{r.priority}</span>
                      <span>{formatDate(r.reminder_date)} at {formatTime(r.reminder_time)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* Immersive Chat Box Window */}
          <article className="chat-window">
            <div className="chat-header">
              <div className="chat-avatar">
                <BotIcon size={20} style={{ color: "var(--color-accent)" }} />
              </div>
              <div className="chat-header-text">
                <span className="chat-header-name">Gemini Memory Companion</span>
                <span className="chat-header-status">Online • Real-Time Agent</span>
              </div>
            </div>

            <div className="chat-messages-container">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.sender}`}>
                  {msg.sender === "assistant" && (
                    <div className="chat-avatar" style={{ width: 28, height: 28, marginRight: 8, fontSize: "0.95rem" }}>
                      <BotIcon size={14} style={{ color: "var(--color-accent)" }} />
                    </div>
                  )}
                  {msg.sender === "user" && (
                    <div className="chat-avatar" style={{ width: 28, height: 28, marginLeft: 8, fontSize: "0.95rem", order: 2 }}>
                      <UserIcon size={14} />
                    </div>
                  )}
                  <div className="message-bubble" style={{ order: 1 }}>
                    <p className="message-text">{msg.text}</p>
                  </div>
                </div>
              ))}
              
              {isChatTyping && (
                <div className="chat-message assistant typing">
                  <div className="chat-avatar" style={{ width: 28, height: 28, marginRight: 8, fontSize: "0.95rem" }}>
                    <BotIcon size={14} style={{ color: "var(--color-accent)" }} />
                  </div>
                  <div className="message-bubble">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Suggestions Bubbles */}
            <div className="chat-suggestions">
              <button 
                className="suggestion-bubble"
                onClick={() => setChatInput("What are my high priority reminders?")}
              >
                <FlameIcon size={12} className="icon-inline" style={{ color: "var(--priority-high)" }} />
                High priorities?
              </button>
              <button 
                className="suggestion-bubble"
                onClick={() => setChatInput("Show reminders I have for this week")}
              >
                <CalendarIcon size={12} className="icon-inline" />
                Weekly summary?
              </button>
              <button 
                className="suggestion-bubble"
                onClick={() => setChatInput("Add a task to pay internet bill next Friday at 9 AM")}
              >
                <SparklesIcon size={12} className="icon-inline" />
                ➕ Pay internet bill?
              </button>
            </div>

            {/* Feed Input Container */}
            <div className="chat-input-row">
              <input
                className="chat-input-box"
                type="text"
                placeholder="Talk to your assistant (e.g., 'delete task 1' or 'schedule laundry tomorrow at 6 PM')..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendChatMessage();
                }}
              />
              <button className="chat-send-btn" onClick={handleSendChatMessage}>
                <span>Send</span>
                <SendIcon size={14} style={{ marginLeft: "4px" }} />
              </button>
            </div>
            
            {feedbackMsg && (
              <div className="chat-feedback-toast">
                {feedbackMsg}
              </div>
            )}
          </article>
        </section>
      )}

      {/* ✏️ Glassmorphic Edit Modal Popup */}
      {editData && (
        <div className="modal-overlay" onClick={() => setEditData(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit Memory Node</h2>
            
            <div className="form-group">
              <label className="form-label" htmlFor="edit-title">Memory Title</label>
              <input
                id="edit-title"
                className="form-input"
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-date">Scheduled Date</label>
                <input
                  id="edit-date"
                  className="form-input"
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-time">Scheduled Time</label>
                <input
                  id="edit-time"
                  className="form-input"
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-priority">Priority</label>
                <select
                  id="edit-priority"
                  className="form-input"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                >
                  <option value="LOW">LOW</option>
                  <option value="NORMAL">NORMAL</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-status">Status</label>
                <select
                  id="edit-status"
                  className="form-input"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="TRIGGERED">TRIGGERED</option>
                  <option value="MISSED">MISSED</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-repeat">Recurrence Rule</label>
                <select
                  id="edit-repeat"
                  className="form-input"
                  value={editRepeat}
                  onChange={(e) => setEditRepeat(e.target.value)}
                >
                  <option value="NONE">NONE</option>
                  <option value="DAILY">DAILY</option>
                  <option value="WEEKLY">WEEKLY</option>
                  <option value="MONTHLY">MONTHLY</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-category">Category</label>
                <select
                  id="edit-category"
                  className="form-input"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                >
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Health">Health</option>
                  <option value="Financial">Financial</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setEditData(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleUpdateMemory}>Save Updates</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
