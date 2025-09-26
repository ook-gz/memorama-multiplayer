import { Room } from "colyseus";
import { guardarJugador, guardarParticipacion } from "./data.controller.js";

export class MemoramaRoom extends Room {
  onCreate() {
    this.maxClients = 5;
    this.setState({
      jugadores: {},
      ganador: null,
    });

    // publicar metadata inicial
    this.setMetadata({
      jugadores: {},
      ganador: null,
    });

    this.onMessage("registrar", async (client, data) => {
      try {
        const jugadorDb = await guardarJugador({
          nombre: data?.nombre || "SinNombre",
          sucursal: data?.sucursal || "N/A",
          email: data?.email || "N/A",
        });

        this.state.jugadores[client.sessionId] = {
          id: jugadorDb.id,
          ready: true,
          terminado: false,
          tiempo: 0,
          nombre: jugadorDb.nombre,
          sucursal: jugadorDb.sucursal,
          email: jugadorDb.email,
        };

        console.log(`✅ Jugador registrado: ${jugadorDb.nombre} (id: ${jugadorDb.id})`);
        this.send(client, "registrado");

        // 🔄 actualizar metadata
        this.actualizarMetadata();

      } catch (err) {
        console.error("❌ Error guardando jugador en BD:", err);
      }

      const todosListos = Object.values(this.state.jugadores).every(j => j.ready);
      if (todosListos) {
        this.state.ganador = null;
        this.broadcast("start");
      }
    });

    this.onMessage("terminado", async (client, { tiempo }) => {
      const jugador = this.state.jugadores[client.sessionId];
      if (!jugador) return;

      if (!jugador.terminado) {
        jugador.terminado = true;
        jugador.tiempo = tiempo;

        try {
          await guardarParticipacion(jugador.id, tiempo, this.roomId);
          console.log(`✅ Participación guardada de ${jugador.nombre}`);
        } catch (err) {
          console.error("❌ Error guardando participación en BD:", err);
        }

        if (!this.state.ganador) {
          this.state.ganador = client.sessionId;
          this.broadcast("ganador", {
            sessionId: client.sessionId,
            jugador: jugador.nombre,
            tiempo,
          });
        }

        // 🔄 actualizar metadata
        this.actualizarMetadata();
      }
    });
  }

  onJoin(client, options) {
    this.state.jugadores[client.sessionId] = {
      ready: false,
      terminado: false,
      tiempo: 0,
      nombre: options?.nombre || "Jugador",
      sucursal: options?.sucursal || "N/A",
      telefono: options?.telefono || "N/A",
    };
    console.log(`Jugador conectado: ${client.sessionId}`);

    // 🔄 actualizar metadata
    this.actualizarMetadata();
  }

  onLeave(client) {
    delete this.state.jugadores[client.sessionId];
    console.log(`Jugador desconectado: ${client.sessionId}`);

    // 🔄 actualizar metadata
    this.actualizarMetadata();
  }

  // helper para publicar estado en metadata
  actualizarMetadata() {
    this.setMetadata({
      jugadores: this.state.jugadores,
      ganador: this.state.ganador,
    });
  }
}
