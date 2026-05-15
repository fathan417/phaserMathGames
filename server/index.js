const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

let queue = [];

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("joinQueue", () => {
    console.log(socket.id, "masuk queue");

    const player = {
      id: socket.id,
      socket: socket,
      timeout: null
    };

    queue.push(player);

    console.log("Current queue:", queue);
    console.log("player", player.id, "joined the queue. Total in queue:", queue.length);

    // cek apakah ada 2 player
    if (queue.length >= 2) {
        const p1 = queue.shift();
        const p2 = queue.shift();
        
        const roomId = `room-${p1.id}-${p2.id}`;
        
        p1.socket.join(roomId);
        p2.socket.join(roomId);

        console.log("Match found:", roomId, "players:", p1.id, p2.id);

        setTimeout(() => {
          io.to(roomId).emit("matchFound", {
            roomId,
            players: [
              { id: p1.id },
              { id: p2.id }
            ]
          });
        }, 3000);

        return;
    }

    // timeout 12 detik → fallback bot
    player.timeout = setTimeout(() => {
      // kalau masih di queue
      const index = queue.findIndex(p => p.id === player.id);
      if (index !== -1) {
        queue.splice(index, 1);

        const roomId = `room-bot-${player.id}`;

        console.log("No match found for", player.id, "starting match with bot in room:", roomId);

        socket.join(roomId);

        setTimeout(() => {
          socket.emit("matchBot", {
            roomId,
            bot: true
          });
        }, 3000);
      }
    }, 12000);
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);

    queue = queue.filter(p => p.id !== socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server jalan di port 3000");
});