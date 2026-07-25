-- Database Schema: Personal Memory Assistant
CREATE DATABASE IF NOT EXISTS memory_assistant;
USE memory_assistant;

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
