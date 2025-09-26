import express from "express";
import { createServer } from "http";
import { Server, matchMaker} from "colyseus";
import { MemoramaRoom } from "./MemoramaRoom.js";

const app = express();
const port = 2567;

app.use(express.static("public"));

const gameServer = new Server({
  server: createServer(app),
});


// Registrar sala
gameServer.define("memorama", MemoramaRoom);

app.get("/partidas", (req, res) => {
  res.sendFile("partidas.html", { root: "./public" });
});

// 2. Endpoint de datos en /api/partidas
app.get("/api/partidas", async (req, res) => {
  try {
    const rooms = await matchMaker.query({ name: "memorama" });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener partidas" });
  }
});

// Iniciar servidor
gameServer.listen(port);
console.log(`Servidor Colyseus corriendo en ws://localhost:${port}`);
