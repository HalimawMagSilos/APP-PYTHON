"""
Utility script to insert dummy patients into MySQL for testing.
Run with: python scripts/load_fixtures.py
"""

import mysql.connector
from app.config import Config

def main():
    conn = mysql.connector.connect(
        host=Config.MYSQL_HOST,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASS,
        database=Config.MYSQL_DB
    )
    cur = conn.cursor()

    patients = [
        ("P001", "Juan Dela Cruz"),
        ("P002", "Maria Santos"),
        ("P003", "Jose Rizal"),
    ]

    for pid, name in patients:
        cur.execute(
            "INSERT INTO patients (patient_id, name) VALUES (%s, %s) ON DUPLICATE KEY UPDATE name=VALUES(name)",
            (pid, name)
        )

    conn.commit()
    cur.close()
    conn.close()
    print("✅ Dummy patients loaded.")

if __name__ == "__main__":
    main()
