import { Room } from "colyseus";

export class MemoramaRoom extends Room {
  onCreate() {
    this.maxClients = 5; // máximo permitido de clientes
    this.setState({
      jugadores: {},
      ganador: null,
      juegoIniciado: false
    });

    // Recibiendo mensaje de que un jugador está listo
    this.onMessage("ready", (client) => {
      this.state.jugadores[client.sessionId].ready = true;

      // Revisar si todos están listos
      const todosListos = Object.values(this.state.jugadores).every(j => j.ready);

      if (todosListos && !this.state.juegoIniciado) {
        this.state.juegoIniciado = true;

        // 🔹 marcar a todos los jugadores actuales como enJuego
        for (const jugador of Object.values(this.state.jugadores)) {
          jugador.enJuego = true;
        }

        this.broadcast("start");
      }
    });

    // Recibiendo la señal de que alguien terminó
    this.onMessage("terminado", (client, { tiempo }) => {
      const jugador = this.state.jugadores[client.sessionId];
      if (!jugador.terminado) {
        jugador.terminado = true;
        jugador.tiempo = tiempo;

        if (!this.state.ganador) {
          this.state.ganador = client.sessionId;

          // 🔹 mandar "ganador" SOLO a jugadores que estaban en la partida
          for (const [sessionId, j] of Object.entries(this.state.jugadores)) {
            if (j.enJuego) {
              const targetClient = this.clients.find(c => c.sessionId === sessionId);
              targetClient?.send("ganador", { jugador: client.sessionId, tiempo });
            }
          }
        }
      }
    });
  }

  onJoin(client) {
    // Si ya hay partida iniciada, no aceptar más jugadores
    if (this.state.juegoIniciado) {
      console.log(`Jugador ${client.sessionId} rechazado (partida en curso)`);
      client.leave();
      return;
    }

    this.state.jugadores[client.sessionId] = {
      terminado: false,
      tiempo: 0,
      ready: false,
      enJuego: false
    };

    console.log(`Jugador conectado: ${client.sessionId}`);
  }

  onLeave(client) {
    delete this.state.jugadores[client.sessionId];
    console.log(`Jugador desconectado: ${client.sessionId}`);
  }
}
