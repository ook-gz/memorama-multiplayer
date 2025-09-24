import express from "express";
import { createServer } from "http";
import { Server } from "colyseus";
import { MemoramaRoom } from "./MemoramaRoom.js";

const app = express();
const port = 2567;

const gameServer = new Server({
  server: createServer(app),
});

// Registrar sala
gameServer.define("memorama", MemoramaRoom);

// Iniciar servidor
gameServer.listen(port);
console.log(`Servidor Colyseus corriendo en ws://localhost:${port}`);
