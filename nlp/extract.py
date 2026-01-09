import re
import psycopg2
import uuid
from datetime import datetime

conn = psycopg2.connect(
    host="postgis",
    dbname="dispatch",
    user="dispatch",
    password="dispatch"
)
cur = conn.cursor()

UNIT_RE = r"(Engine|Medic|Police|Rescue)\s?\d+"
ADDR_RE = r"\d+\s+[A-Za-z]+\s+(Street|St|Road|Rd|Avenue|Ave)"

def process(text, audio):
    units = re.findall(UNIT_RE, text)
    address = re.search(ADDR_RE, text)
    address = address.group(0) if address else None

    cur.execute("""
      INSERT INTO dispatch_events
      (id, transcript, units, address, received_at, audio_file)
      VALUES (%s,%s,%s,%s,%s,%s)
    """, (
        str(uuid.uuid4()),
        text,
        units,
        address,
        datetime.utcnow(),
        f"/audio/{audio}"
    ))
    conn.commit()
