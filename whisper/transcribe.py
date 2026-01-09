import os
import time
import requests
from faster_whisper import WhisperModel

model = WhisperModel("base", device="cpu")
processed = set()

while True:
    for f in os.listdir("/audio"):
        if f.endswith(".wav") and f not in processed:
            segments, _ = model.transcribe(f"/audio/{f}", language="en")
            text = " ".join([s.text for s in segments])

            requests.post(
                "http://api:3000/transcript",
                json={"text": text, "audio": f}
            )

            processed.add(f)
    time.sleep(1)
