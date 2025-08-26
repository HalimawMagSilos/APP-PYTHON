-- Run this SQL to create the database and table (adjust privileges as needed)

-- In Render, the database is already created when you provision it.
-- So no CREATE DATABASE here — just tables.

CREATE TABLE IF NOT EXISTS face_embeddings (
  embedding_id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL,
  embedding TEXT NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: automatically update updated_at on row update
-- (Postgres doesn't have ON UPDATE CURRENT_TIMESTAMP like MySQL)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_timestamp ON face_embeddings;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON face_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();