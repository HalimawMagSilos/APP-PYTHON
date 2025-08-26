-- Run this SQL to create the database and table (adjust privileges as needed)
CREATE DATABASE IF NOT EXISTS afrs_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE afrs_db;

CREATE TABLE IF NOT EXISTS face_embeddings (
  embedding_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  embedding TEXT NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
