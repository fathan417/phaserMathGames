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
const rooms = {};
const battleQueues = {};

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("joinQueue", () => {
    const player = {
      id: socket.id,
      socket: socket,
      timeout: null
    };

    queue.push(player);

    if (queue.length >= 2) {
        const p1 = queue.shift();
        const p2 = queue.shift();
        
        const roomId = `room-${p1.id}-${p2.id}`;

        rooms[roomId] = {
          players: [
            { id: p1.id, character: null, ready: false },
            { id: p2.id, character: null, ready: false }
          ]
        };

        p1.socket.roomId = roomId;
        p2.socket.roomId = roomId;
        
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

    player.timeout = setTimeout(() => {
      const index = queue.findIndex(p => p.id === player.id);
      if (index !== -1) {
        const p1 = queue.shift();
        const roomId = `room-bot-${player.id}`;
  
        rooms[roomId] = {
          players: [
            { id: p1.id, character: null, ready: false }
          ]
        };
        p1.socket.roomId = roomId;
        p1.socket.join(roomId);
        console.log("No match found for", player.id, "starting match with bot in room:", roomId);
        setTimeout(() => {
          io.to(roomId).emit("matchBot", {
            roomId,
            players: [
              { id: p1.id }
            ]
          });
        }, 2000);
      }
    }, 8000);
  });

  socket.on("selectCharacter", (data) => {
      const roomId = socket.roomId;
      if (!roomId || !rooms[roomId]) return;
      
      const player = rooms[roomId].players.find(p => p.id === socket.id);
      if (!player) return;

      player.character = data;
      player.ready = true;

      if (data.isBotMatch) {
        socket.emit("startGame", {
          roomId,
          players: [
            { id: socket.id, character: data, role: "P1", spawn: "playerSpawn1" }
          ]
        });

      } else {
        const room = rooms[roomId];
        const p1 = room.players[0];
        const p2 = room.players[1];
        const allReady = room.players.every(p => p.ready && p.character);
  
        if (allReady) {
          io.to(roomId).emit("startGame", {
            roomId,
            players: [
              { id: p1.id, character: p1.character, role: "P1", spawn: "playerSpawn1" },
              { id: p2.id, character: p2.character, role: "P2", spawn: "playerSpawn2" }
            ]
          });
        }
      }

  });

  socket.on("playerMove", (data) => {
    const roomId = socket.roomId;
    if (!roomId) return;

    socket.to(roomId).emit("enemyMove", {
      id: socket.id,
      x: data.x,
      y: data.y,
      anim: data.anim,
      dir: data.dir
    });
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);

    queue = queue.filter(p => p.id !== socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server jalan di port 3000");
});