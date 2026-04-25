import { useEffect, useState } from "react";
import axios from "axios";

function App() {

  const [editData, setEditData] = useState(null);
const [editText, setEditText] = useState("");

const handleEdit = (r) => {
  setEditData(r);
  setEditText(r.title);
};

const updateReminder = async () => {
  try {
    await axios.put(`${API}/${editData.id}`, {
      title: editText,
    });

    setEditData(null);
    setEditText("");
    fetchReminders();
  } catch (err) {
    console.error(err);
  }
};

  const [selectedDate, setSelectedDate] = useState(new Date());
  // 🔹 Input text state (user natural language input)
  const [text, setText] = useState("");

  // 🔹 Stores reminders fetched from backend
  const [reminders, setReminders] = useState([]);

  // 🔹 To avoid duplicate notifications for same reminder
  const [notifiedIds, setNotifiedIds] = useState(new Set());

  // 🔹 Backend API base URL
  const API = "http://localhost:5000/api/reminders";


  // 🔹 Format date into readable format (Indian style)
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  // 🔹 Convert 24hr time to 12hr AM/PM format
  const formatTime = (timeStr) => {
    const date = new Date(`1970-01-01T${timeStr}`);
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  // 🔹 Fetch all reminders from backend
  const fetchReminders = async () => {
    try {
      const res = await axios.get(API);
      setReminders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Load reminders once when page loads
  useEffect(() => {
    fetchReminders();
  }, []);


  // 🔔 Ask permission for browser notifications
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // 🔔 Function to show browser notification popup
  const showNotification = (title) => {
    if (Notification.permission === "granted") {
      new Notification("🔔 Reminder", {
        body: title,
        icon: "https://cdn-icons-png.flaticon.com/512/1827/1827392.png"
      });
    }
  };

  // 🔔 Runs every 60 seconds to check reminders
  useEffect(() => {
    const interval = setInterval(() => {
      checkReminders();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

const checkReminders = () => {
  const now = new Date();

  const currentDate = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().slice(0, 5);

  console.log("🧠 Checking reminders...");
  console.log("Time:", currentTime);

  reminders.forEach((r) => {
    const reminderDate = r.reminder_date;
    const reminderTime = r.reminder_time.slice(0, 5);

    if (
      reminderDate === currentDate &&
      reminderTime === currentTime &&
      !notifiedIds.has(r.id)
    ) {
      console.log("🔥 TRIGGERED:", r.title);

      const message =
        r.priority === "HIGH"
          ? "🔥 IMPORTANT: " + r.title.toUpperCase()
          : r.title.toUpperCase();

      showNotification(message);

      setNotifiedIds((prev) => new Set(prev).add(r.id));
    }
  });
};

  // 🔹 Add reminder to backend
  const addReminder = async () => {
    if (!text.trim()) {
      alert("Enter some text");
      return;
    }

    try {
      await axios.post(`${API}/add`, { text });
      setText("");
      fetchReminders();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding reminder");
    }
  };

  // 🔹 Delete reminder by ID
  const deleteReminder = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);
      fetchReminders();
    } catch (err) {
      console.error(err);
    }
  };

const validReminders = reminders;

  return (
  <div className="container">
    
    {/* 🔹 App Title */}
    <h1>🧠 Personal Memory Assistant</h1>

    {/* 🔹 Input box */}
    <div className="inputBox">
      <input
        type="text"
        placeholder="e.g. meeting tomorrow 5pm"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            addReminder();
          }
        }}
      />
      <button onClick={addReminder}>Add</button>
    </div>


    {/* 🔹 Reminder list */}
    <div className="list">
      {validReminders.length === 0 ? (
        <p>No reminders yet</p>
      ) : (
        validReminders.map((r) => (
          <div className="card" key={r.id || r.reminder_id}>
            
            <div>
              {/* 🔹 Title */}
              <h3>
                {r.title.toUpperCase()}{" "}
                {r.priority === "HIGH" && "🔥"}
              </h3>

              {/* 🔹 Date + Time */}
              <p>
                📅 {formatDate(r.reminder_date)} ⏰{" "}
                {formatTime(r.reminder_time)}
              </p>
            </div>

            {/* 🔹 Actions */}
            <div className="actions">
              <button onClick={() => handleEdit(r)}>✏️</button>
              <button onClick={() => deleteReminder(r.id || r.reminder_id)}>❌</button>
            </div>

          </div>
        ))
      )}
    </div>

    {/* 🔹 EDIT MODAL (IMPORTANT: inside return) */}
    {editData && (
      <div className="modal">
        <div className="modalBox">
          <h2>Edit Reminder</h2>

          <input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />

          <div className="modalActions">
            <button onClick={updateReminder}>Save</button>
            <button onClick={() => setEditData(null)}>Cancel</button>
          </div>

        </div>
      </div>
    )}

  </div>
);

}

export default App;

