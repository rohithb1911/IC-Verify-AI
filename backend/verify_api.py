import sys
import os

# Set Python path to include current dir
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import database
import analyzer
import sqlite3

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
        
        # Count seeded items
        cursor.execute("SELECT COUNT(*) FROM reference_db")
        ref_count = cursor.fetchone()[0]
        print(f"  - Seeded references count: {ref_count}")
        
        conn.close()
        print(">> Database Verification Passed.")
    except Exception as e:
        print(f">> Database Verification Failed: {str(e)}")
        return False
        
    # 2. Test OpenCV image processing & calculations mock-ups
    print("\n[Test 2] OpenCV & Analyzer Segment Processing")
    try:
        # Create a mock image file to process
        import numpy as np
        import cv2
        
        mock_img = np.zeros((400, 600, 3), dtype=np.uint8)
        # Draw some rectangles to look like an IC body
        cv2.rectangle(mock_img, (150, 100), (450, 300), (50, 50, 50), -1)
        # Draw legs
        for i in range(4):
            cv2.rectangle(mock_img, (100, 120 + i*40), (150, 140 + i*40), (200, 200, 200), -1)
            cv2.rectangle(mock_img, (450, 120 + i*40), (500, 140 + i*40), (200, 200, 200), -1)
        # Draw some text
        cv2.putText(mock_img, "NE555P", (200, 200), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 2)
        
        # Save mock raw image
        test_filename = "test_chip_raw.jpg"
        test_filepath = os.path.join(analyzer.UPLOAD_DIR, test_filename)
        cv2.imwrite(test_filepath, mock_img)
        print(f"  - Saved mock chip image to {test_filepath}")
        
        # Run analyzer
        result = analyzer.process_ic_image(test_filepath, test_filename)
        print("  - Processing completed. Keys returned:")
        for key, val in result.items():
            if "url" in key:
                print(f"    * {key}: {val}")
                
        # Validate output details
        print(f"  - Part Number parsed: {result['part_number']}")
        print(f"  - Decision parsed: {result['final_decision']}")
        print(f"  - Counterfeit Probability: {result['counterfeit_probability']}%")
        
        # Clean up
        if os.path.exists(test_filepath):
            os.remove(test_filepath)
            
        print(">> OpenCV & Analyzer Verification Passed.")
    except Exception as e:
        print(f">> OpenCV & Analyzer Verification Failed: {str(e)}")
        return False
        
    print("\n=== All Tests Passed Successfully ===")
    return True

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
