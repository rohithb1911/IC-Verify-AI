import sqlite3
conn = sqlite3.connect('backend/ic_verify.db')
c = conn.cursor()
c.execute("SELECT * FROM system_logs ORDER BY id DESC LIMIT 5")
for r in c.fetchall():
    print(r)
