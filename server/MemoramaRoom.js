import { Room } from "colyseus";

export class MemoramaRoom extends Room {
  onCreate() {
    this.maxClients = 5;
    this.setState({
      jugadores: {},
      ganador: null
    });

    // 📌 Guardar nombre del jugador
    this.onMessage("registrar", (client, data) => {
      if (this.state.jugadores[client.sessionId]) {
        this.state.jugadores[client.sessionId].nombre = data.nombre;
        this.state.jugadores[client.sessionId].sucursal = data.sucursal;
        this.state.jugadores[client.sessionId].telefono = data.telefono;

        console.log(`Datos para ClientArray.sessionId: ${data}`);

        this.broadcast("registrado");
      }
    });

    this.onMessage("ready", (client) => {
      this.state.jugadores[client.sessionId].ready = true;

      const todosListos = Object.values(this.state.jugadores).every(j => j.ready);
      if (todosListos) {
        this.broadcast("start");
      }
    });

    this.onMessage("terminado", (client, { tiempo }) => {
      const jugador = this.state.jugadores[client.sessionId];

      if (!jugador.terminado) {
        jugador.terminado = true;
        jugador.tiempo = tiempo;

        if (!this.state.ganador) {
          this.state.ganador = client.sessionId;

          // 📌 Ahora mandamos el nombre en lugar del ID
          this.broadcast("ganador", { 
            jugador: jugador.nombre || client.sessionId, 
            tiempo 
          });
        }
      }
    });
  }

  onJoin(client) {
    this.state.jugadores[client.sessionId] = { 
      terminado: false, 
      tiempo: 0,
      nombre: null,
      sucursal: null,
      telefono: null,
      ready: false
    };
    console.log(`Jugador conectado: ${client.sessionId}`);
  }

  onLeave(client) {
    delete this.state.jugadores[client.sessionId];
    console.log(`Jugador desconectado: ${client.sessionId}`);
  }
}
