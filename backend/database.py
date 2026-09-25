import os
import sqlite3
import datetime
import json

import tempfile
import shutil

is_vercel = os.environ.get("VERCEL") == "1" or os.environ.get("NOW_REGION") is not None
if is_vercel:
    tmp_db = os.path.join(tempfile.gettempdir(), "ic_verify.db")
    orig_db = os.path.join(os.path.dirname(__file__), "ic_verify.db")
    if not os.path.exists(tmp_db) and os.path.exists(orig_db):
        try:
            shutil.copyfile(orig_db, tmp_db)
        except Exception:
            pass
    DB_FILE = tmp_db
else:
    DB_FILE = os.path.join(os.path.dirname(__file__), "ic_verify.db")

def get_db_connection():
    try:
        conn = sqlite3.connect(DB_FILE)
    except sqlite3.OperationalError:
        tmp_db = os.path.join(tempfile.gettempdir(), "ic_verify.db")
        if not os.path.exists(tmp_db) and os.path.exists(os.path.join(os.path.dirname(__file__), "ic_verify.db")):
            shutil.copyfile(os.path.join(os.path.dirname(__file__), "ic_verify.db"), tmp_db)
        conn = sqlite3.connect(tmp_db)
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
            markings_template TEXT,
            category TEXT DEFAULT 'General'
        )
    """)
    
    # Auto-migration: check if category column exists in reference_db
    cursor.execute("PRAGMA table_info(reference_db)")
    ref_cols = [row[1] for row in cursor.fetchall()]
    if "category" not in ref_cols:
        cursor.execute("ALTER TABLE reference_db ADD COLUMN category TEXT DEFAULT 'General'")
    
    # 3. Inspections / Scans Table (with Damage Detection columns)
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
            inspector_name TEXT,
            damage_detected INTEGER DEFAULT 0,
            damage_score REAL DEFAULT 0.0,
            damage_count INTEGER DEFAULT 0,
            damage_severity TEXT DEFAULT 'NONE',
            damage_details TEXT DEFAULT '[]',
            damage_image_url TEXT,
            physical_integrity REAL DEFAULT 100.0
        )
    """)
    
    # Auto-migration: check if damage columns exist in existing inspections table
    cursor.execute("PRAGMA table_info(inspections)")
    existing_cols = [row[1] for row in cursor.fetchall()]
    
    damage_cols = [
        ("damage_detected", "INTEGER DEFAULT 0"),
        ("damage_score", "REAL DEFAULT 0.0"),
        ("damage_count", "INTEGER DEFAULT 0"),
        ("damage_severity", "TEXT DEFAULT 'NONE'"),
        ("damage_details", "TEXT DEFAULT '[]'"),
        ("damage_image_url", "TEXT"),
        ("physical_integrity", "REAL DEFAULT 100.0")
    ]
    for col_name, col_type in damage_cols:
        if col_name not in existing_cols:
            cursor.execute(f"ALTER TABLE inspections ADD COLUMN {col_name} {col_type}")
    
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
    
    # Comprehensive Genuine IC Reference Database Catalog (47 industrial & maker parts across 6 categories)
    references = [
        # 1. Microcontrollers & Processors
        ("ATMEGA328P-PU", "Microchip Technology", "DIP-28", "Atmel Rounded Sans-Serif", "https://upload.wikimedia.org/wikipedia/commons/e/e7/Microchip_Technology_logo.svg", "https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-8-bit-Microcontroller-ATmega328-328P_Datasheet.pdf", 28, "ATMEGA328P-PU|ATMEL|YYWW", "Microcontrollers & Processors"),
        ("ATTINY85-20PU", "Microchip Technology", "DIP-8", "Atmel Standard Sans", "https://upload.wikimedia.org/wikipedia/commons/e/e7/Microchip_Technology_logo.svg", "https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-2586-AVR-8-bit-Microcontroller-ATtiny25-ATtiny45-ATtiny85_Datasheet.pdf", 8, "ATTINY85-20PU|ATMEL|YYWW", "Microcontrollers & Processors"),
        ("STM32F103C8T6", "STMicroelectronics", "LQFP-48", "ST Condensed Sans-Serif", "https://upload.wikimedia.org/wikipedia/commons/e/ec/STMicroelectronics_logo.svg", "https://www.st.com/resource/en/datasheet/stm32f103c8.pdf", 48, "STM32F103C8T6|ST|YYWW", "Microcontrollers & Processors"),
        ("STM32F401RET6", "STMicroelectronics", "LQFP-64", "ST Condensed Sans-Serif", "https://upload.wikimedia.org/wikipedia/commons/e/ec/STMicroelectronics_logo.svg", "https://www.st.com/resource/en/datasheet/stm32f401re.pdf", 64, "STM32F401RET6|ST|YYWW", "Microcontrollers & Processors"),
        ("ESP32-WROOM-32", "Espressif Systems", "SMD-38", "Espressif Block Font", "https://upload.wikimedia.org/wikipedia/commons/f/f6/Espressif_Systems_logo.svg", "https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32_datasheet_en.pdf", 38, "ESP32-WROOM-32|ESP|YYWW", "Microcontrollers & Processors"),
        ("ESP8266-12F", "Espressif Systems", "SMD-16", "Espressif Block Font", "https://upload.wikimedia.org/wikipedia/commons/f/f6/Espressif_Systems_logo.svg", "https://www.espressif.com/sites/default/files/documentation/0a-esp8266ex_datasheet_en.pdf", 16, "ESP8266MOD|ESP|YYWW", "Microcontrollers & Processors"),
        ("RP2040", "Raspberry Pi", "QFN-56", "Raspberry Pi Modern Sans", "https://upload.wikimedia.org/wikipedia/en/c/cb/Raspberry_Pi_Logo.svg", "https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf", 56, "RP2-B2|RPi|YYWW", "Microcontrollers & Processors"),
        ("PIC16F877A-I/P", "Microchip Technology", "DIP-40", "Microchip Serif Laser", "https://upload.wikimedia.org/wikipedia/commons/e/e7/Microchip_Technology_logo.svg", "https://ww1.microchip.com/downloads/en/DeviceDoc/39582b.pdf", 40, "PIC16F877A-I/P|MICROCHIP|YYWW", "Microcontrollers & Processors"),
        ("MSP430G2553IN20", "Texas Instruments", "DIP-20", "TI Laser Sans", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/msp430g2553.pdf", 20, "MSP430G2553|TI|YYWW", "Microcontrollers & Processors"),
        ("NRF52832-QFAA", "Nordic Semiconductor", "QFN-48", "Nordic Semi Micro Sans", "https://upload.wikimedia.org/wikipedia/commons/6/6c/Nordic_Semiconductor_logo.svg", "https://infocenter.nordicsemi.com/pdf/nRF52832_PS_v1.4.pdf", 48, "N52832|NORDIC|YYWW", "Microcontrollers & Processors"),

        # 2. Operational Amplifiers & Comparators
        ("NE555P", "Texas Instruments", "DIP-8", "Standard TI Sans-Serif", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/ne555.pdf", 8, "NE555P|TI|YYWW", "Op-Amps & Comparators"),
        ("LM741CN", "Texas Instruments", "DIP-8", "Standard TI Serif", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/lm741.pdf", 8, "LM741CN|TI|YYWW", "Op-Amps & Comparators"),
        ("LM358N", "Texas Instruments", "DIP-8", "Standard TI Sans-Serif", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/lm358.pdf", 8, "LM358N|TI|YYWW", "Op-Amps & Comparators"),
        ("LM324N", "Texas Instruments", "DIP-14", "Standard TI Sans-Serif", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/lm324.pdf", 14, "LM324N|TI|YYWW", "Op-Amps & Comparators"),
        ("NE5532P", "Texas Instruments", "DIP-8", "TI High Precision Font", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/ne5532.pdf", 8, "NE5532P|TI|YYWW", "Op-Amps & Comparators"),
        ("TL072CP", "Texas Instruments", "DIP-8", "Standard TI Serif", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/tl072.pdf", 8, "TL072CP|TI|YYWW", "Op-Amps & Comparators"),
        ("OP07CP", "Analog Devices", "DIP-8", "ADI Precision Sans", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Analog_Devices_Logo.svg/1200px-Analog_Devices_Logo.svg.png", "https://www.analog.com/media/en/technical-documentation/data-sheets/op07.pdf", 8, "OP07CPZ|ADI|YYWW", "Op-Amps & Comparators"),
        ("LM393N", "Texas Instruments", "DIP-8", "Standard TI Sans-Serif", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/lm393.pdf", 8, "LM393N|TI|YYWW", "Op-Amps & Comparators"),
        ("LM339N", "Texas Instruments", "DIP-14", "Standard TI Sans-Serif", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/lm339.pdf", 14, "LM339N|TI|YYWW", "Op-Amps & Comparators"),
        ("MCP6002-I/P", "Microchip Technology", "DIP-8", "Microchip Micro Sans", "https://upload.wikimedia.org/wikipedia/commons/e/e7/Microchip_Technology_logo.svg", "https://ww1.microchip.com/downloads/en/DeviceDoc/21733j.pdf", 8, "MCP6002-I/P|MICROCHIP|YYWW", "Op-Amps & Comparators"),

        # 3. Voltage Regulators & Power Management
        ("LM317T", "ON Semiconductor", "TO-220", "ON Semi Gothic Style", "https://upload.wikimedia.org/wikipedia/commons/d/de/ON_Semiconductor_Logo.svg", "https://www.onsemi.com/pdf/datasheet/lm317-d.pdf", 3, "LM317T|ON|YYWW", "Voltage Regulators"),
        ("L7805CV", "STMicroelectronics", "TO-220", "ST Industrial Sans", "https://upload.wikimedia.org/wikipedia/commons/e/ec/STMicroelectronics_logo.svg", "https://www.st.com/resource/en/datasheet/l78.pdf", 3, "L7805CV|ST|YYWW", "Voltage Regulators"),
        ("L7812CV", "STMicroelectronics", "TO-220", "ST Industrial Sans", "https://upload.wikimedia.org/wikipedia/commons/e/ec/STMicroelectronics_logo.svg", "https://www.st.com/resource/en/datasheet/l78.pdf", 3, "L7812CV|ST|YYWW", "Voltage Regulators"),
        ("AMS1117-3.3", "Advanced Monolithic Systems", "SOT-223", "AMS Compact Font", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/ON_Semiconductor_Logo.svg/1200px-ON_Semiconductor_Logo.svg.png", "http://www.advanced-monolithic.com/pdf/ds1117.pdf", 4, "AMS1117-3.3|AMS|YYWW", "Voltage Regulators"),
        ("AMS1117-5.0", "Advanced Monolithic Systems", "SOT-223", "AMS Compact Font", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/ON_Semiconductor_Logo.svg/1200px-ON_Semiconductor_Logo.svg.png", "http://www.advanced-monolithic.com/pdf/ds1117.pdf", 4, "AMS1117-5.0|AMS|YYWW", "Voltage Regulators"),
        ("LM2596S-5.0", "Texas Instruments", "TO-263", "TI Power Sans", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/lm2596.pdf", 5, "LM2596S-5.0|TI|YYWW", "Voltage Regulators"),
        ("TPS5430DDAR", "Texas Instruments", "SOIC-8", "TI Powerpad Font", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/tps5430.pdf", 8, "TPS5430|TI|YYWW", "Voltage Regulators"),
        ("MP1584EN", "Monolithic Power Systems", "SOIC-8", "MPS Micro Sans", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/ON_Semiconductor_Logo.svg/1200px-ON_Semiconductor_Logo.svg.png", "https://www.monolithicpower.com/en/documentview/index/index/doc_id/1075/", 8, "MP1584EN|MPS|YYWW", "Voltage Regulators"),
        ("MC34063AP1G", "ON Semiconductor", "DIP-8", "ON Semi Gothic", "https://upload.wikimedia.org/wikipedia/commons/d/de/ON_Semiconductor_Logo.svg", "https://www.onsemi.com/pdf/datasheet/mc34063a-d.pdf", 8, "MC34063AP1G|ON|YYWW", "Voltage Regulators"),
        ("XL6009E1", "XLSEMI", "TO-263", "XLSEMI Block Laser", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/ON_Semiconductor_Logo.svg/1200px-ON_Semiconductor_Logo.svg.png", "http://www.xlsemi.com/datasheet/XL6009%20datasheet.pdf", 5, "XL6009E1|XL|YYWW", "Voltage Regulators"),

        # 4. Digital Logic & Shift Registers
        ("74HC595N", "Texas Instruments", "DIP-16", "Standard TI Logic Sans", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/sn74hc595.pdf", 16, "SN74HC595N|TI|YYWW", "Digital Logic"),
        ("74HC165N", "Texas Instruments", "DIP-16", "Standard TI Logic Sans", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/sn74hc165.pdf", 16, "SN74HC165N|TI|YYWW", "Digital Logic"),
        ("74HC00N", "Texas Instruments", "DIP-14", "Standard TI Logic Sans", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/sn74hc00.pdf", 14, "SN74HC00N|TI|YYWW", "Digital Logic"),
        ("74HC04N", "Texas Instruments", "DIP-14", "Standard TI Logic Sans", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/sn74hc04.pdf", 14, "SN74HC04N|TI|YYWW", "Digital Logic"),
        ("CD4017BE", "Texas Instruments", "DIP-16", "TI CMOS Serif", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/cd4017b.pdf", 16, "CD4017BE|TI|YYWW", "Digital Logic"),
        ("SN74HC138N", "Texas Instruments", "DIP-16", "Standard TI Logic Sans", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/sn74hc138.pdf", 16, "SN74HC138N|TI|YYWW", "Digital Logic"),
        ("SN74HC245N", "Texas Instruments", "DIP-20", "Standard TI Logic Sans", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/sn74hc245.pdf", 20, "SN74HC245N|TI|YYWW", "Digital Logic"),

        # 5. Interface & Communication ICs
        ("MAX232CPE+", "Analog Devices", "DIP-16", "Maxim Line Condensed", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Analog_Devices_Logo.svg/1200px-Analog_Devices_Logo.svg.png", "https://www.analog.com/media/en/technical-documentation/data-sheets/MAX220-MAX249.pdf", 16, "MAX232CPE+|MAXIM|YYWW", "Interface & Comms"),
        ("MAX485CPA+", "Analog Devices", "DIP-8", "Maxim Line Condensed", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Analog_Devices_Logo.svg/1200px-Analog_Devices_Logo.svg.png", "https://www.analog.com/media/en/technical-documentation/data-sheets/MAX1487-MAX491.pdf", 8, "MAX485CPA+|MAXIM|YYWW", "Interface & Comms"),
        ("FT232RL", "FTDI Chip", "SSOP-28", "FTDI Clean Sans", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/ON_Semiconductor_Logo.svg/1200px-ON_Semiconductor_Logo.svg.png", "https://ftdichip.com/wp-content/uploads/2020/08/DS_FT232R.pdf", 28, "FT232RL|FTDI|YYWW", "Interface & Comms"),
        ("CH340G", "WCH", "SOIC-16", "WCH Industrial Font", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/ON_Semiconductor_Logo.svg/1200px-ON_Semiconductor_Logo.svg.png", "http://www.wch-ic.com/downloads/CH340DS1_PDF.html", 16, "CH340G|WCH|YYWW", "Interface & Comms"),
        ("CP2102-GMR", "Silicon Labs", "QFN-28", "Silicon Labs Precision Sans", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/ON_Semiconductor_Logo.svg/1200px-ON_Semiconductor_Logo.svg.png", "https://www.silabs.com/documents/public/data-sheets/CP2102-9.pdf", 28, "CP2102|SILABS|YYWW", "Interface & Comms"),
        ("MCP2515-I/P", "Microchip Technology", "DIP-18", "Microchip Laser Rounded", "https://upload.wikimedia.org/wikipedia/commons/e/e7/Microchip_Technology_logo.svg", "https://ww1.microchip.com/downloads/en/DeviceDoc/21801e.pdf", 18, "MCP2515-I/P|MICROCHIP|YYWW", "Interface & Comms"),
        ("PCA9685PW", "NXP Semiconductors", "TSSOP-28", "NXP Standard Sans", "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/NXP_Semiconductors_logo.svg/1200px-NXP_Semiconductors_logo.svg.png", "https://www.nxp.com/docs/en/data-sheet/PCA9685.pdf", 28, "PCA9685PW|NXP|YYWW", "Interface & Comms"),
        ("PCF8574T", "NXP Semiconductors", "SOIC-16", "NXP Standard Sans", "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/NXP_Semiconductors_logo.svg/1200px-NXP_Semiconductors_logo.svg.png", "https://www.nxp.com/docs/en/data-sheet/PCF8574_PCF8574A.pdf", 16, "PCF8574T|NXP|YYWW", "Interface & Comms"),

        # 6. Motor Drivers & Power Transistor Arrays
        ("L298N", "STMicroelectronics", "Multiwatt-15", "ST High-Power Sans", "https://upload.wikimedia.org/wikipedia/commons/e/ec/STMicroelectronics_logo.svg", "https://www.st.com/resource/en/datasheet/l298.pdf", 15, "L298N|ST|YYWW", "Motor Drivers"),
        ("L293D", "STMicroelectronics", "DIP-16", "ST Industrial Sans", "https://upload.wikimedia.org/wikipedia/commons/e/ec/STMicroelectronics_logo.svg", "https://www.st.com/resource/en/datasheet/l293d.pdf", 16, "L293D|ST|YYWW", "Motor Drivers"),
        ("ULN2003A", "Texas Instruments", "DIP-16", "Standard TI Sans-Serif", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/uln2003a.pdf", 16, "ULN2003A|TI|YYWW", "Motor Drivers"),
        ("DRV8825PWP", "Texas Instruments", "HTSSOP-28", "TI Power Sans", "https://logodownload.org/wp-content/uploads/2021/04/texas-instruments-logo.png", "https://www.ti.com/lit/ds/symlink/drv8825.pdf", 28, "DRV8825|TI|YYWW", "Motor Drivers"),
        ("A4988SETTR-T", "Allegro MicroSystems", "QFN-28", "Allegro Block Laser", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/ON_Semiconductor_Logo.svg/1200px-ON_Semiconductor_Logo.svg.png", "https://www.allegromicro.com/en/products/bms-and-motor-drivers/bipolar-stepper-motor-drivers/a4988", 28, "A4988SET|ALLEGRO|YYWW", "Motor Drivers")
    ]

    # Insert or update each reference part
    for ref in references:
        cursor.execute("""
            INSERT INTO reference_db (part_number, manufacturer, package_type, font_style, logo_url, datasheet_url, pin_count, markings_template, category)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(part_number) DO UPDATE SET
                manufacturer=excluded.manufacturer,
                package_type=excluded.package_type,
                font_style=excluded.font_style,
                logo_url=excluded.logo_url,
                datasheet_url=excluded.datasheet_url,
                pin_count=excluded.pin_count,
                markings_template=excluded.markings_template,
                category=excluded.category
        """, ref)
        
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
        
    # Seed mock scans with damage examples if empty
    cursor.execute("SELECT COUNT(*) FROM inspections")
    if cursor.fetchone()[0] == 0:
        stm32_defects = json.dumps([
            {"id": 1, "type": "Crack / Fracture", "severity": "Critical", "confidence": 95.8, "bbox": [140, 95, 120, 24], "description": "Deep transverse packaging fracture line detected"},
            {"id": 2, "type": "Edge Chipping / Corner Break", "severity": "High", "confidence": 91.2, "bbox": [20, 15, 35, 30], "description": "Corner packaging resin breakage"}
        ])
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
                100.0,
                98.5,
                100.0,
                1.5,
                "GENUINE (PASSED)",
                "AI Inspection Engine",
                0,
                0.0,
                0,
                "NONE",
                "[]",
                "/uploads/mock_ne555_genuine_damage.jpg",
                100.0
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
                24.5,
                38.2,
                40.0,
                88.4,
                "REJECTED (COUNTERFEIT & DAMAGED)",
                "AI Inspection Engine",
                1,
                75.5,
                2,
                "CRITICAL",
                stm32_defects,
                "/uploads/mock_stm32_counterfeit_damage.jpg",
                24.5
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
                100.0,
                99.2,
                100.0,
                0.8,
                "GENUINE (PASSED)",
                "AI Inspection Engine",
                0,
                0.0,
                0,
                "NONE",
                "[]",
                "/uploads/mock_esp32_genuine_damage.jpg",
                100.0
            )
        ]
        cursor.executemany("""
            INSERT INTO inspections (
                timestamp, raw_image_url, processed_image_url, detected_text,
                manufacturer, part_number, ocr_confidence, logo_match,
                font_similarity, surface_quality, package_match, database_match,
                counterfeit_probability, final_decision, inspector_name,
                damage_detected, damage_score, damage_count, damage_severity,
                damage_details, damage_image_url, physical_integrity
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, historical_scans)
        
    conn.commit()

if __name__ == "__main__":
    init_db()
    print("Database initialized & schema migrated successfully.")
