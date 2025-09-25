import { Room } from "colyseus";

export class MemoramaRoom extends Room {
  onCreate() {
    this.maxClients = 5; //maximo permitido de clientes
    this.setState({//estados del room
      jugadores: {},
      ganador: null
    });
    
    //recibiendo mensaje de que todos están listos
    this.onMessage("ready", (client) => {
      this.state.jugadores[client.sessionId].ready = true;

      // Revisar si todos están listos
      const todosListos = Object.values(this.state.jugadores).every(j => j.ready);
      if (todosListos) {
        this.broadcast("start");
      }
    });

    //Recibiendo la señal que alguien terminó
    this.onMessage("terminado", (client, { tiempo }) => {
      if (!this.state.jugadores[client.sessionId].terminado) {
        this.state.jugadores[client.sessionId].terminado = true;
        this.state.jugadores[client.sessionId].tiempo = tiempo;

        if (!this.state.ganador) {
          this.state.ganador = client.sessionId;
          this.broadcast("ganador", { jugador: client.sessionId, tiempo });
        }
      }
    });
  }

  onJoin(client) {
    this.state.jugadores[client.sessionId] = { terminado: false, tiempo: 0 };
    console.log(`Jugador conectado: ${client.sessionId}`);
  }

  onLeave(client) {
    delete this.state.jugadores[client.sessionId];
    console.log(`Jugador desconectado: ${client.sessionId}`);
  }
}
