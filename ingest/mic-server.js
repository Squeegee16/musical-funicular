import { Server } from "socket.io";
import http from "http";
import fs from "fs";

const server = http.createServer();
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", socket => {
  socket.on("mic-audio", data => {
    const file = `/audio/mic_${Date.now()}.wav`;
    fs.writeFileSync(file, Buffer.from(data));
  });
});

server.listen(3001);