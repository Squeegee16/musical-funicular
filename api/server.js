import express from "express";
import http from "http";
import { Server } from "socket.io";
import { db } from "./db.js";

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.post("/transcript", async (req, res) => {
  const { text, audio } = req.body;
  io.emit("dispatch:new", { transcript: text, audio_file: `/audio/${audio}` });
  res.sendStatus(200);
});

app.get("/dispatch", async (req, res) => {
  const result = await db.query(`
    SELECT *, ST_X(geom::geometry) lon, ST_Y(geom::geometry) lat
    FROM dispatch_events
    ORDER BY received_at DESC
    LIMIT 100
  `);
  res.json(result.rows);
});

server.listen(3000);
