import { Room } from "colyseus";
import { guardarJugador, guardarParticipacion } from "./data.controller.js";

export class MemoramaRoom extends Room {
    onCreate() {
        this.maxClients = 5;
        this.minClients = 2;
        this.setState({
            jugadores: {},
            ganador: null,
            partidaTerminada: false,
            ranking: [],
            historialRankings: []
        });

        this.setMetadata({
            jugadores: {},
            ganador: null,
            ranking: [],
            partidaTerminada: false
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
                this.actualizarMetadata();

            } catch (err) {
                console.error("❌ Error guardando jugador en BD:", err);
            }

            this.verificarInicioPartida();
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
                
                this.broadcast("memorama_completado", {
                    sessionId: client.sessionId,
                    jugador: jugador.nombre,
                    tiempo,
                });
                
                this.verificarTodosTerminados("completado");
                this.actualizarMetadata();
                
                if (this.state.ganador === null) {
                    this.state.ganador = jugador.nombre;
                    console.log(`🎉 Ganador registrado: ${jugador.nombre}`);
                }
            }
        });

        this.onMessage("tiempoFuera", (client) => {
            const jugador = this.state.jugadores[client.sessionId];
            if (!jugador) return;

            if (!jugador.terminado) {
                jugador.terminado = true;
                jugador.tiempo = 60; // ⬅️ Cambiar esto
                console.log(`⏰ Jugador ${jugador.nombre} se quedó sin tiempo`);
            }

            this.verificarTodosTerminados("tiempo_fuera");
        });

        this.onMessage("tiempoFueraGlobal", (client) => {
            const jugador = this.state.jugadores[client.sessionId];
            if (!jugador) return;

            console.log('⏰⏰⏰ TIEMPO FUERA GLOBAL activado ⏰⏰⏰');
            
            Object.values(this.state.jugadores).forEach(jugador => {
                if (!jugador.terminado) {
                    jugador.terminado = false;
                    jugador.tiempo = Infinity; // ⬅️ Cambiar esto
                    console.log(`⏰ ${jugador.nombre} marcado por tiempo fuera global`);
                }
            });

            this.verificarTodosTerminados("tiempo_fuera_global");
        });
    }

    onJoin(client, options) {
        console.log(options);
        this.state.jugadores[client.sessionId] = {
            ready: false,
            terminado: false,
            tiempo: 0,
            nombre: options?.nombre || "Jugador",
            sucursal: options?.sucursal || "N/A",
            telefono: options?.telefono || "N/A",
        };
        console.log(`Jugador conectado: ${client.sessionId}`);
        this.actualizarMetadata();
    }

    onLeave(client) {
        const jugadorDesconectado = this.state.jugadores[client.sessionId];
        delete this.state.jugadores[client.sessionId];
        console.log(`Jugador desconectado: ${client.sessionId}`);
        this.actualizarMetadata();
        this.verificarInicioPartida();
    }

    actualizarMetadata() {
        this.setMetadata({
            jugadores: this.state.jugadores,
            ganador: this.state.ganador,
            ranking: this.state.ranking,
            partidaTerminada: this.state.partidaTerminada
        });
    }

    verificarTodosTerminados(motivo = "completado") {
        const jugadoresActivos = Object.values(this.state.jugadores);
        
        if (jugadoresActivos.length === 0) return;
        
        const todosTerminados = jugadoresActivos.every(jugador => jugador.terminado);
        
        if (todosTerminados && !this.state.partidaTerminada) {
            this.state.partidaTerminada = true;
            console.log(`🎯 TODOS los jugadores han terminado (motivo: ${motivo})!`);
            

            const ranking = this.crearRankingCompleto(jugadoresActivos);
            
            // ✅ NUEVO: Guardar ranking en el estado
            this.state.ranking = ranking;
            
            // ✅ NUEVO: Guardar en historial
            this.state.historialRankings.push({
                fecha: new Date().toISOString(),
                motivo: motivo,
                ranking: ranking
            });
            
            const evento = motivo.includes("tiempo_fuera") ? "partidaFinalizada" : "todosTerminaron";
            
            this.broadcast(evento, {
                ranking: ranking.map((jugador, index) => ({
                    posicion: index + 1,
                    nombre: jugador.nombre,
                    tiempo: jugador.tiempo,
                    completado: jugador.completado,
                    esGanador: jugador.esGanador
                })),
                ganador: this.state.ganador,
                motivo: motivo
            });

            this.actualizarMetadata();

            
            console.log(`🏆 Ranking final (${motivo}):`, ranking);
            this.reiniciarSala();
        }
    }

    crearRankingCompleto(jugadoresActivos) {
        return jugadoresActivos
            .sort((a, b) => {
                const aCompleto = a.tiempo > 0 && a.tiempo <= 30;
                const bCompleto = b.tiempo > 0 && b.tiempo <= 30;
                
                if (aCompleto && bCompleto) return a.tiempo - b.tiempo;
                if (aCompleto && !bCompleto) return -1;
                if (!aCompleto && bCompleto) return 1;
                return a.nombre.localeCompare(b.nombre);
            })
            .map((jugador, index) => ({
                ...jugador,
                posicion: index + 1,
                completado: jugador.tiempo > 0 && jugador.tiempo <= 30,
                esGanador: index === 0 && (jugador.tiempo > 0 && jugador.tiempo <= 30)
            }));
    }

    obtenerRanking() {
        return this.state.ranking;
    }

    obtenerHistorialRankings() {
        return this.state.historialRankings;
    }

    verificarInicioPartida() {
        const jugadoresActivos = Object.values(this.state.jugadores);
        if (jugadoresActivos.length === 0) return;
        
        const hayMinimoJugadores = jugadoresActivos.length >= this.minClients;
        const todosListos = jugadoresActivos.every(j => j.ready);
        const puedeIniciar = hayMinimoJugadores && todosListos && !this.state.partidaTerminada;
        
        if (puedeIniciar) {
            console.log(`🚀 Iniciando partida con ${jugadoresActivos.length} jugadores`);
            this.state.ganador = null;
            this.broadcast("start");
        } else {
            console.log(`⏳ Esperando más jugadores: ${jugadoresActivos.length}/${this.minClients} - Todos listos: ${todosListos}`);
        }
    }
    
    reiniciarSala() {
        this.clock.setTimeout(() => {
            console.log('🔄 Reiniciando sala...');
            
            Object.values(this.state.jugadores).forEach(jugador => {
                jugador.ready = false;
                jugador.terminado = false;
                jugador.tiempo = 0;
            });
            
            this.state.ganador = null;
            this.state.partidaTerminada = false;
            this.broadcast("salaReiniciada");
            console.log('✅ Sala reiniciada, lista para nueva partida');
            this.verificarInicioPartida();
            
        }, 10000);
    }
}