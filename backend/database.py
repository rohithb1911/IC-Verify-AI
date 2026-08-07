import os
import sqlite3
import datetime
import json

DB_FILE = os.path.join(os.path.dirname(__file__), "ic_verify.db")

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Users Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'operator'
        )
    """)
    
    # 2. Reference Database Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reference_db (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            part_number TEXT UNIQUE NOT NULL,
            manufacturer TEXT NOT NULL,
            package_type TEXT NOT NULL,
            font_style TEXT NOT NULL,
            logo_url TEXT,
            datasheet_url TEXT,
            pin_count INTEGER NOT NULL,
            markings_template TEXT
        )
    """)
    
    # 3. Inspections / Scans Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS inspections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            raw_image_url TEXT,
            processed_image_url TEXT,
            detected_text TEXT,
            manufacturer TEXT,
            part_number TEXT,
            ocr_confidence REAL,
            logo_match REAL,
            font_similarity REAL,
            surface_quality REAL,
            package_match REAL,
            database_match REAL,
            counterfeit_probability REAL,
            final_decision TEXT,
            inspector_name TEXT
        )
    """)
    
    # 4. System Logs Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            level TEXT NOT NULL,
            message TEXT NOT NULL
        )
    """)
    
    conn.commit()
    seed_data(conn)
    conn.close()

def seed_data(conn):
    cursor = conn.cursor()
    
    # Check if reference database has items
    cursor.execute("SELECT COUNT(*) FROM reference_db")
    if cursor.fetchone()[0] == 0:
        references = [
            ("NE555P", "Texas Instruments", "DIP-8", "Standard TI Sans-Serif", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/ne555.pdf", 8, "NE555P|TI|YYWW"),
            ("LM741CN", "Texas Instruments", "DIP-8", "Standard TI Serif", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/lm741.pdf", 8, "LM741CN|TI|YYWW"),
            ("ATMEGA328P-PU", "Microchip Technology", "DIP-28", "Atmel Rounded Sans-Serif", "https://upload.wikimedia.org/wikipedia/commons/e/e7/Microchip_Technology_logo.svg", "https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-8-bit-Microcontroller-ATmega328-328P_Datasheet.pdf", 28, "ATMEGA328P-PU|ATMEL|YYWW"),
            ("STM32F103C8T6", "STMicroelectronics", "LQFP-48", "ST Condensed Sans-Serif", "https://upload.wikimedia.org/wikipedia/commons/e/ec/STMicroelectronics_logo.svg", "https://www.st.com/resource/en/datasheet/stm32f103c8.pdf", 48, "STM32F103C8T6|ST|YYWW"),
            ("ESP32-WROOM-32", "Espressif Systems", "SMD-38", "Espressif Block Font", "https://upload.wikimedia.org/wikipedia/commons/f/f6/Espressif_Systems_logo.svg", "https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32_datasheet_en.pdf", 38, "ESP32-WROOM-32|ESP|YYWW"),
            ("LM317T", "ON Semiconductor", "TO-220", "ON Semi Gothic Style", "https://upload.wikimedia.org/wikipedia/commons/d/de/ON_Semiconductor_Logo.svg", "https://www.onsemi.com/pdf/datasheet/lm317-d.pdf", 3, "LM317T|ON|YYWW")
        ]
        
        cursor.executemany("""
            INSERT INTO reference_db (part_number, manufacturer, package_type, font_style, logo_url, datasheet_url, pin_count, markings_template)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, references)
        
    # Check if admin user exists
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO users (username, password_hash, role)
            VALUES ('admin', 'pbkdf2:sha256:260000$adminhash', 'administrator')
        """)
        cursor.execute("""
            INSERT INTO users (username, password_hash, role)
            VALUES ('operator', 'pbkdf2:sha256:260000$operatorhash', 'operator')
        """)
        
    # Seed some mock scans if empty
    cursor.execute("SELECT COUNT(*) FROM inspections")
    if cursor.fetchone()[0] == 0:
        historical_scans = [
            (
                (datetime.datetime.now() - datetime.timedelta(days=2)).isoformat(),
                "/uploads/mock_ne555_genuine.jpg",
                "/uploads/mock_ne555_genuine_processed.jpg",
                "NE555P TI 2145 BATCH9",
                "Texas Instruments",
                "NE555P",
                98.2,
                97.5,
                96.8,
                99.0,
                98.5,
                100.0,
                1.5,
                "GENUINE",
                "AI Inspection Engine"
            ),
            (
                (datetime.datetime.now() - datetime.timedelta(days=1)).isoformat(),
                "/uploads/mock_stm32_counterfeit.jpg",
                "/uploads/mock_stm32_counterfeit_processed.jpg",
                "STM32F103C8T6 ST 9945 CRACKED",
                "STMicroelectronics",
                "STM32F103C8T6",
                82.4,
                42.1,
                55.3,
                95.0,
                38.2,
                40.0,
                88.4,
                "COUNTERFEIT",
                "AI Inspection Engine"
            ),
            (
                (datetime.datetime.now() - datetime.timedelta(hours=4)).isoformat(),
                "/uploads/mock_esp32_genuine.jpg",
                "/uploads/mock_esp32_genuine_processed.jpg",
                "ESP32-WROOM-32 ESP 2311 BATCH23",
                "Espressif Systems",
                "ESP32-WROOM-32",
                97.8,
                98.1,
                95.5,
                98.0,
                99.2,
                100.0,
                0.8,
                "GENUINE",
                "AI Inspection Engine"
            )
        ]
        cursor.executemany("""
            INSERT INTO inspections (
                timestamp, raw_image_url, processed_image_url, detected_text,
                manufacturer, part_number, ocr_confidence, logo_match,
                font_similarity, surface_quality, package_match, database_match,
                counterfeit_probability, final_decision, inspector_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, historical_scans)
        
    conn.commit()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
