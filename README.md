dispatch-globe/
├── docker-compose.yml
├── .env
├── data/
│   ├── audio/
│   ├── postgres/
│   └── logs/
├── ingest/
│   ├── mic-server.js
│   └── package.json
├── whisper/
│   ├── transcribe.py
│   └── requirements.txt
├── nlp/
│   └── extract.py
├── api/
│   ├── server.js
│   ├── db.js
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── icons/
│       ├── engine.png
│       ├── medic.png
│       ├── police.png
│       └── rescue.png

# Dispatch Globe – Offline Deployment

## Requirements
- Docker Engine 24+
- Docker Compose plugin
- Linux host with sound card (for line-in)

## Install
1. Extract the tarball
2. cd dispatch-globe
3. ./deploy.sh

## Access
- UI: http://<host>:8080
- API: http://<host>:3000

## Stop
docker compose down
