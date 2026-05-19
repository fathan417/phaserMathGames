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

// ─────────────────────────────────────────────
// Setiap room battle punya state:
//   answerQueue  : antrian jawaban yang masuk (race condition resolver)
//   questionIndex: index soal saat ini (agar sinkron)
//   lockedRound  : flag agar 1 soal hanya diproses 1 kali
// ─────────────────────────────────────────────
const battleState = {};

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // ── MATCHMAKING ──────────────────────────────
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
          players: [{ id: p1.id }, { id: p2.id }]
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
          players: [{ id: p1.id, character: null, ready: false }]
        };
        p1.socket.roomId = roomId;
        p1.socket.join(roomId);

        console.log("No match for", player.id, "→ bot match:", roomId);
        setTimeout(() => {
          io.to(roomId).emit("matchBot", {
            roomId,
            players: [{ id: p1.id }]
          });
        }, 2000);
      }
    }, 8000);
  });

  // ── SELECT CHARACTER ─────────────────────────
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
        players: [{ id: socket.id, character: data, role: "P1", spawn: "playerSpawn1" }]
      });
    } else {
      const room = rooms[roomId];
      const p1 = room.players[0];
      const p2 = room.players[1];
      const allReady = room.players.every(p => p.ready && p.character);

      if (allReady) {
        // Inisialisasi battle state untuk room ini
        battleState[roomId] = {
          answerQueue: [],
          questionIndex: 0,
          lockedRound: false
        };

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

  // ── BATTLE READY ──────────────────────────────
  socket.on("battleReady", () => {
      const roomId = socket.roomId;
      if (!roomId || !battleState[roomId]) return;

      const state = battleState[roomId];

      if (!state.readyPlayers) state.readyPlayers = new Set();
      state.readyPlayers.add(socket.id);

      const room = rooms[roomId];
      const totalPlayers = room.players.length;

      console.log(`[${roomId}] Battle ready: ${state.readyPlayers.size}/${totalPlayers}`);

      if (state.readyPlayers.size >= totalPlayers) {
          io.to(roomId).emit("battleStart");
          startBattleTimer(roomId);
      }
  });

  // ── SUBMIT ANSWER (battle multiplayer) ───────
  //
  // Client mengirim:
  // {
  //   isCorrect     : boolean  – apakah jawaban player ini benar
  //   questionIndex : number   – index soal yang dijawab (validasi sinkronisasi)
  //   timestamp     : number   – Date.now() di sisi client
  // }
  //
  // Alur:
  // 1. Terima jawaban, masukkan ke answerQueue room
  // 2. Tunggu 200ms → beri kesempatan jawaban lawan datang (race window)
  // 3. Setelah window tutup, pilih pemenang ronde:
  //      - Jika hanya 1 jawaban → langsung proses
  //      - Jika 2 jawaban masuk → bandingkan timestamp, yang lebih kecil menang
  //      - Jika keduanya salah → enemy menyerang (timeout-like penalty)
  // 4. Broadcast "battleResult" ke semua client di room
  // 5. Broadcast "nextQuestion" agar soal sinkron berpindah
  // ─────────────────────────────────────────────
  socket.on("submitAnswer", (data) => {
    const roomId = socket.roomId;
    if (!roomId || !battleState[roomId]) return;

    const state = battleState[roomId];

    // Abaikan jika ronde ini sudah dikunci (sudah ada yang menang)
    if (state.lockedRound) return;

    // Abaikan jika soal yang dijawab sudah tidak sinkron
    if (data.questionIndex !== state.questionIndex) return;

    state.answerQueue.push({
      playerId: socket.id,
      isCorrect: data.isCorrect,
      timestamp: data.timestamp
    });

    // Jika ini jawaban pertama → mulai race window 200ms
    if (state.answerQueue.length === 1) {
      setTimeout(() => {
        resolveRound(roomId);
      }, 200);
    }

    // Jika sudah 2 jawaban masuk → langsung resolve tanpa tunggu
    if (state.answerQueue.length >= 2) {
      resolveRound(roomId);
    }
  });

  // ── HP SYNC ───────────────────────────────
  socket.on("hpSync", (data) => {
      const roomId = socket.roomId;
      if (!roomId) return;
      socket.to(roomId).emit("hpSync", data);
  });

  // ── PLAYER MOVE ──────────────────────────────
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

  // ── DISCONNECT ───────────────────────────────
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    queue = queue.filter(p => p.id !== socket.id);

    // Beritahu lawan bahwa player disconnect
    const roomId = socket.roomId;
    if (roomId) {
      socket.to(roomId).emit("opponentDisconnected");
    }
  });
});

// ── RESOLVE ROUND ─────────────────────────────
//
// Dipanggil setelah race window tutup.
// Memilih siapa yang menyerang, lalu broadcast hasilnya.
// ─────────────────────────────────────────────
function resolveRound(roomId) {
  const state = battleState[roomId];
  if (!state || state.lockedRound) return;

  // Kunci ronde agar tidak diproses dua kali
  state.lockedRound = true;

  const queue = state.answerQueue;

  let attacker = null; // playerId yang menyerang, null = enemy (bot/timeout)

  if (queue.length === 0) {
    // Tidak ada yang jawab → tidak seharusnya terjadi, skip
    advanceQuestion(roomId);
    return;
  }

  // Filter yang menjawab benar
  const correct = queue.filter(a => a.isCorrect);

  if (correct.length === 0) {
    // Semua salah → enemy yang menyerang (attacker = null artinya "enemy")
    attacker = null;
  } else if (correct.length === 1) {
    // Hanya 1 yang benar
    attacker = correct[0].playerId;
  } else {
    // Keduanya benar → yang paling cepat (timestamp terkecil) menang
    correct.sort((a, b) => a.timestamp - b.timestamp);
    attacker = correct[0].playerId;
  }

  console.log(`[${roomId}] Round resolved → attacker: ${attacker ?? "enemy"}`);

  // Broadcast ke seluruh room
  // Setiap client akan interpret:
  //   attacker === socket.id sendiri  → "saya yang menyerang"  → onCorrectAnswer + playerAttackTrigger
  //   attacker === lawan              → "lawan yang menyerang" → onWrongAnswer + enemyAttackTrigger
  //   attacker === null               → "enemy menyerang"      → onWrongAnswer + enemyAttackTrigger
  const wrongPlayers = queue
      .filter(a => !a.isCorrect)
      .map(a => a.playerId);

  io.to(roomId).emit("battleResult", {
      attacker: attacker,          // playerId yang menyerang, atau null jika semua salah
      wrongPlayers: wrongPlayers,  // array playerId yang salah jawab
      questionIndex: state.questionIndex
  });

  // Pindah ke soal berikutnya setelah delay animasi (sesuaikan dengan durasi animasi battle)
  setTimeout(() => {
      advanceQuestion(roomId);
      // Reset dan restart timer server setelah soal pindah
      if (battleState[roomId]) {
          clearInterval(battleState[roomId].timerInterval);
          startBattleTimer(roomId);
      }
  }, 1500);
}

// ── ADVANCE QUESTION ──────────────────────────
// Reset state ronde dan broadcast nextQuestion ke semua client
// ─────────────────────────────────────────────
function advanceQuestion(roomId) {
  const state = battleState[roomId];
  if (!state) return;

  state.questionIndex++;
  state.answerQueue = [];
  state.lockedRound = false;

  io.to(roomId).emit("nextQuestion", {
    questionIndex: state.questionIndex
  });
}

// ── START TIMER ──────────────────────────
// Mulai timer battle (misal 50 detik) dan broadcast setiap detik ke client agar bisa sinkron tampilannya.
// ─────────────────────────────────────────────
function startBattleTimer(roomId) {
    const state = battleState[roomId];
    if (!state) return;

    state.timer = 50;

    state.timerInterval = setInterval(() => {
        if (!battleState[roomId]) {
            clearInterval(state.timerInterval);
            return;
        }

        state.timer--;

        io.to(roomId).emit("timerSync", { timer: state.timer });

        if (state.timer <= 0) {
            clearInterval(state.timerInterval);
            io.to(roomId).emit("timerTimeout");
        }
    }, 1000);
}

server.listen(3000, () => {
  console.log("Server jalan di port 3000");
});