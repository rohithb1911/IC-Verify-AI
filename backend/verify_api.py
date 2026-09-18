import sys
import os
import sqlite3
import json
import numpy as np
import cv2

# Set Python path to include current dir
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import database
import analyzer

def run_tests():
    print("=== IC Verify AI Verification Script ===")
    
    # 1. Test database connection & tables
    print("\n[Test 1] Database Connection & Schema Verification")
    try:
        database.init_db()
        conn = database.get_db_connection()
        cursor = conn.cursor()
        
        # Verify tables exist
        tables = ["users", "reference_db", "inspections", "system_logs"]
        for table in tables:
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
            res = cursor.fetchone()
            if res:
                print(f"  - Table '{table}' verified.")
            else:
                raise Exception(f"Table '{table}' missing from database schema.")
        
        # Verify damage columns exist
        cursor.execute("PRAGMA table_info(inspections)")
        col_names = [r[1] for r in cursor.fetchall()]
        damage_cols = ["damage_detected", "damage_score", "damage_count", "damage_severity", "damage_details", "damage_image_url", "physical_integrity"]
        for dc in damage_cols:
            if dc in col_names:
                print(f"  - Column '{dc}' verified in inspections.")
            else:
                raise Exception(f"Column '{dc}' missing in inspections.")
                
        # Count seeded items
        cursor.execute("SELECT COUNT(*) FROM reference_db")
        ref_count = cursor.fetchone()[0]
        print(f"  - Seeded references count: {ref_count}")
        
        conn.close()
        print(">> Database Verification Passed.")
    except Exception as e:
        print(f">> Database Verification Failed: {str(e)}")
        return False
        
    # 2. Test OpenCV Clean Chip Processing
    print("\n[Test 2] OpenCV Clean Chip Analysis")
    try:
        clean_img = np.zeros((400, 600, 3), dtype=np.uint8)
        cv2.rectangle(clean_img, (150, 100), (450, 300), (50, 50, 50), -1)
        cv2.putText(clean_img, "NE555P", (200, 200), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 2)
        
        clean_filename = "test_clean_ne555.jpg"
        clean_filepath = os.path.join(analyzer.UPLOAD_DIR, clean_filename)
        cv2.imwrite(clean_filepath, clean_img)
        
        res_clean = analyzer.process_ic_image(clean_filepath, clean_filename)
        print(f"  - Clean Part: {res_clean['part_number']}")
        print(f"  - Damage Detected: {res_clean['damage_detected']}")
        print(f"  - Physical Integrity: {res_clean['physical_integrity']}%")
        print(f"  - Final Decision: {res_clean['final_decision']}")
        
        if os.path.exists(clean_filepath):
            os.remove(clean_filepath)
        print(">> Clean Chip Verification Passed.")
    except Exception as e:
        print(f">> Clean Chip Verification Failed: {str(e)}")
        return False
        
    # 3. Test OpenCV Damaged Chip Processing (Cracks & Chipping)
    print("\n[Test 3] OpenCV Damaged Chip Analysis (Cracks & Chipping)")
    try:
        damaged_img = np.zeros((400, 600, 3), dtype=np.uint8)
        # IC Body
        cv2.rectangle(damaged_img, (150, 100), (450, 300), (50, 50, 50), -1)
        # Marking
        cv2.putText(damaged_img, "STM32F103", (180, 200), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2)
        # Inject prominent jagged crack across body
        cv2.line(damaged_img, (200, 120), (320, 260), (0, 0, 0), 4)
        cv2.line(damaged_img, (260, 190), (360, 220), (0, 0, 0), 3)
        # Inject chipped corner (notch cutout)
        cv2.rectangle(damaged_img, (140, 90), (180, 130), (0, 0, 0), -1)
        
        damaged_filename = "test_stm32_crack_damaged.jpg"
        damaged_filepath = os.path.join(analyzer.UPLOAD_DIR, damaged_filename)
        cv2.imwrite(damaged_filepath, damaged_img)
        
        res_damaged = analyzer.process_ic_image(damaged_filepath, damaged_filename)
        print(f"  - Damaged Part: {res_damaged['part_number']}")
        print(f"  - Damage Detected: {res_damaged['damage_detected']}")
        print(f"  - Damage Defect Count: {res_damaged['damage_count']}")
        print(f"  - Damage Severity: {res_damaged['damage_severity']}")
        print(f"  - Physical Integrity: {res_damaged['physical_integrity']}%")
        print(f"  - Final Decision: {res_damaged['final_decision']}")
        print(f"  - Damage Image URL: {res_damaged['damage_image_url']}")
        print("  - Detected Defect List:")
        for d in res_damaged['damages']:
            print(f"    * [{d['severity']}] {d['type']} (Confidence: {d['confidence']}%) - {d['description']}")
            
        assert res_damaged['damage_detected'] is True, "Expected damage_detected to be True"
        assert res_damaged['damage_count'] > 0, "Expected damage_count > 0"
        assert res_damaged['physical_integrity'] < 100.0, "Expected physical_integrity < 100"
        
        if os.path.exists(damaged_filepath):
            os.remove(damaged_filepath)
        print(">> Damaged Chip Verification Passed.")
    except Exception as e:
        print(f">> Damaged Chip Verification Failed: {str(e)}")
        return False
        
    print("\n=== All Tests Passed Successfully ===")
    return True

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
