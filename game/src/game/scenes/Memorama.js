import { Scene } from 'phaser';
import { resizeBackground, setupResizeListener, getResponsiveFontSize } from '../helpers/resizeHelper.js';
import { crearCartas } from '../helpers/crearCartas.js';
import { Client } from 'colyseus.js';
import Swal from 'sweetalert2';

export class Memorama extends Scene {

    cartasNombres = [
        "card1","card2","card3", "card4", "card5", "card6", "card7", "card8", "card9", "card10"
    ];

    contenedorJuego = {
        x: 150,
        y: 170,
        paddingX: 100,
        paddingY: 140
    }

    constructor() {
        super('Memorama');
    }

    init() {
        this.baseCardWidth = 120;
        this.baseCardHeight = 180;
        this.cameras.main.fadeIn(500);
        
        this.cartas = [];
        this.cartaAbierta = undefined;
        this.canMove = false;
        
        this.tiempoRestante = 60; // segundos de cuenta regresiva
        this.tiempoTexto;         // texto en pantalla
        this.paresTexto;         // texto en pantalla
        this.temporizador;        // evento de Phaser

        this.pares_completados = 0;
        this.totalPares = 0;

        this.puedeJugar = false;

        this.juegoIniciado = false;
        this.juegoTerminado = false;
        
        this.font = 'vcr mono';

        //conexion a mi server multiplayer
        this.client = new Client("http://192.168.0.27:2567");
        
        if (typeof Swal !== 'undefined') {
            // Forzar cierre de cualquier modal pendiente
            Swal.close();
        }

        //limpiar al cerrar escena
        this.events.on("shutdown", () => {
            if (this.room) {
                this.room.removeAllListeners();
                this.room._listenersRegistered = false;
            }
            this.input.removeAllListeners();
            this.detenerTemporizador();

            Swal.close();

        });
    }

    getResponsiveFontSize(baseSize = 40) {
        const baseWidth = 960; // Tu ancho base de diseño
        const scaleFactor = this.sys.game.scale.width / baseWidth;
        return Math.max(24, baseSize * scaleFactor); // Mínimo 24px para legibilidad
    }

    crearContenedorCartas() {
        const seleccionadas = Phaser.Utils.Array.Shuffle(this.cartasNombres).slice(0, 6);

        this.totalPares = seleccionadas.length;
        
        this.paresTexto = this.add.text(this.sys.game.scale.width - 550, 30, `Pares encontrados: ${this.pares_completados}/6`, {
            fontSize: `${getResponsiveFontSize(32, this.sys.game.scale.width)}px`,
            color: "#264194ff",
            stroke: "#ffff",
            strokeThickness: 2,
            fontFamily: this.font
        }).setOrigin(1, 0).setDepth(5);

        // 2. Duplicar para formar los pares
        const cartasBarajadas = Phaser.Utils.Array.Shuffle([
            ...seleccionadas,
            ...seleccionadas
        ]);

        const totalCartas = cartasBarajadas.length;

        // 🔹 Calcular columnas y filas automáticamente (grid lo más cuadrado posible)
        const columnas = Math.ceil(Math.sqrt(totalCartas));
        const filas = Math.ceil(totalCartas / columnas);

        const cartaAncho = this.baseCardWidth + this.contenedorJuego.paddingX;
        const cartaAlto  = this.baseCardHeight + this.contenedorJuego.paddingY;

        // 🔹 Tamaño total del grid
        const gridAncho = (columnas - 1) * cartaAncho;
        const gridAlto  = (filas - 1) * cartaAlto;

        // 🔹 Posición inicial (para centrar el grid)
        const startX = this.sys.game.scale.width / 2 - gridAncho / 2;
        const startY = this.sys.game.scale.height / 2 - gridAlto / 2;

        return cartasBarajadas.map((name, index) => {
            const col = index % columnas;
            const fila = Math.floor(index / columnas);

            const x = startX + col * cartaAncho;
            const y = startY + fila * cartaAlto;

            const nuevaCarta = crearCartas({
                scene: this,
                x,
                y: -1000, // animación de entrada
                frontTexture: name,
                cardName: name
            });

            // Animación de aparición
            this.add.tween({
                targets: nuevaCarta.gameObject,
                duration: 800,
                delay: index * 100,
                y: y
            });

            return nuevaCarta;
        });
    }

    detenerTemporizador() {
        if (this.temporizador) {
            this.temporizador.remove();
            this.temporizador = null;
        }
    }

    reiniciarJuego() {
        this.cartaAbierta = undefined;
        this.pares_completados = 0;   // 🔹 Reiniciar pares encontrados
        this.juegoIniciado = false;   // 🔹 Permitir que el servidor vuelva a lanzar "start"
        this.juegoTerminado = false;

        this.cameras.main.fadeOut(200 * this.cartas.length);

        this.cartas.slice().reverse().forEach((carta, index) => {
            this.add.tween({
                targets: carta.gameObject,
                duration: 500,
                y: 1000,
                delay: index * 100,
                onComplete: () => carta.gameObject.destroy()
            });
        });
        
        this.tiempoRestante = 60;
        this.detenerTemporizador();

        this.time.addEvent({
            delay: 200 * this.cartas.length,
            callback: () => {
                this.cartas = [];
                this.canMove = false;
                this.puedeJugar = false;
                this.scene.restart();
            }
        });
    }
    
    async terminarJuego() {
        await Swal.close();
        
        const result = await Swal.fire({
            title: "Tiempo fuera",
            text: 'La partida ha finalizado',
            confirmButtonText: 'Volver al inicio',
        });
        
        if (this.room) {
            this.room.leave();
        }
        this.reiniciarJuego();
    }

    iniciarJuego() {
        // Crear cartas
        this.cartas = this.crearContenedorCartas();
        
        // Texto del tiempo (arriba a la derecha)
        this.tiempoTexto = this.add.text(this.sys.game.scale.width - 30, 30, `Tiempo: ${this.tiempoRestante}`, {
            fontSize: `${getResponsiveFontSize(32, this.sys.game.scale.width)}px`,
            color: "#264194ff",
            stroke: "#ffff",
            strokeThickness: 2,
            fontFamily: this.font
        }).setOrigin(1, 0).setDepth(5);

        // Evento que resta tiempo cada segundo
        this.temporizador = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: async () => {
                if(!this.puedeJugar)return
                this.tiempoRestante--;
                this.tiempoTexto.setText(`Tiempo: ${this.tiempoRestante} Seg`);

                if (this.tiempoRestante <= 0) {
                    this.temporizador.remove(); // detener
                    this.temporizador = null;
                    this.tiempoRestante = 0; // asegurar que no vaya a negativos
                    this.tiempoTexto.setText(`Tiempo: 0 Seg`);

                    this.canMove = false;
                    this.puedeJugar = false;
                    
                    this.room.send("tiempoFuera");
                }
            }
        });

        // permitir movimiento después de animación de entrada
        this.time.addEvent({
            delay: 200 * this.cartas.length,
            callback: () => { 
                this.canMove = true; 
                this.puedeJugar = true;
            }
        });

        // Hover cursor (opcional)
        this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer) => {
            if (!this.canMove) return;
            const carta = this.cartas.find(c => c.gameObject.getBounds().contains(pointer.x, pointer.y));
            this.input.setDefaultCursor(carta ? "pointer" : "default");
        });

        // Click global (usa getBounds().contains)
        this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer) => {
            if (!this.canMove || !this.cartas.length) return;

            const carta = this.cartas.find(c => c.gameObject.getBounds().contains(pointer.x, pointer.y));
            if (!carta) return;

            this.canMove = false;

            // Si ya hay una carta abierta
            if (this.cartaAbierta) {
                // mismo objeto -> ignorar
                if (this.cartaAbierta === carta) {
                    this.canMove = true;
                    return;
                }

                carta.flip(() => {
                    if (this.cartaAbierta.cardName === carta.cardName) {

                        this.pares_completados++;
                        this.paresTexto.setText(`Pares encontrados: ${this.pares_completados}/6`);
                        
                        this.cartaAbierta.destroy();
                        carta.destroy();
                        // remover todas las cartas con ese nombre (pares)
                        this.cartas = this.cartas.filter(c => c.cardName !== carta.cardName);
                        this.cartaAbierta = undefined;
                        this.canMove = true;
                    } else {
                        carta.flip();
                        this.cartaAbierta.flip(() => {
                            this.cartaAbierta = undefined;
                            this.canMove = true;
                        });
                    }
                    
                    // WIN
                    if (this.cartas.length === 0) {
                        // this.sound.play("victory");
                        this.detenerTemporizador();
                        this.canMove = false;

                        const tiempoFinal = 60 - this.tiempoRestante;
                        this.room.send("terminado", { tiempo: tiempoFinal });
                    }
                });

            } else {
                // primera carta seleccionada
                carta.flip(() => { this.canMove = true; });
                this.cartaAbierta = carta;
            }
        });
    }

    crearFormulario() {
        
        Swal.fire({
            title: "",
            html: `
                <style>
                    .form-container {
                        max-width: 700px;
                        margin: 0 auto;
                    }
                    .form-header {
                        margin-bottom: 30px;
                    }
                    .form-title {
                        font-size: 1.8rem;
                        font-weight: 600;
                        margin-bottom: 25px;
                    }
                    .form-label {
                        font-size: 1.2rem;
                        font-weight: 500;
                    }
                    .form-control {
                        font-size: 1.1rem;
                        padding: 12px 15px;
                        height: auto;
                    }
                    .btn-submit {
                        font-size: 1.2rem;
                        padding: 12px 30px;
                        width: 100%;
                    }
                </style>
                <form id="player-form" class="bg-white p-3 rounded-2" style="max-width:700px">
                    <div class="d-flex justify-content-center">
                        <img class="text-center" src="../../assets/ultralaboratorios.png" alt="">
                    </div>
                    <br/>
                    <h2 class="text-center">Ingresa sus datos de colaborador para jugar</h2>
                    <div class="mb-3">
                        <label for="nombre" class="form-label">Nombre</label>
                        <input type="text" class="form-control" name="nombre" id="nombre">
                    </div>
                    <br/>
                    <div class="mb-3">
                        <label for="email" class="form-label">Número</label>
                        <input type="number" class="form-control" name="email" id="email">
                    </div>
                    <br/>
                    <div class="mb-3">
                        <label for="sucursal" class="form-label">Región</label>
                        <input type="text" class="form-control" name="sucursal" id="sucursal">
                    </div>
                </form>
            `,
            focusConfirm: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            confirmButtonText: "Registrarme",
            preConfirm: () => {
                const nombre = document.getElementById("nombre").value;
                const sucursal = document.getElementById("sucursal").value;
                const email = document.getElementById("email").value;

                if (!nombre || !sucursal || !email) {
                    Swal.showValidationMessage("Todos los campos son obligatorios");
                    return false;
                }

                return { nombre, sucursal, email };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const { nombre, sucursal, email } = result.value;
                
                console.log("Datos del formulario:", { nombre, sucursal, email });

                // 🔹 Enviar a Colyseus
                this.room.send("registrar", { nombre, sucursal, email });

                // 🔹 Mostrar modal de loading inmediatamente
                Swal.fire({
                    title: "Registrando...",
                    text: "Procesando tu información",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                this.room.onMessage("registrado", () => {
                    console.log("Bienvenido: ", nombre);

                    // Cerrar modal de loading
                    Swal.close();

                    // 🔹 Mostrar modal de "esperando jugadores"
                    Swal.fire({
                        title: "¡Registro exitoso! 🎉",
                        html: `
                            <div class="text-center">
                                <p><strong>${nombre}</strong> - ${sucursal}</p>
                                <p>Esperando a que más jugadores se unan...</p>
                                <div class="spinner-border text-primary mt-3" role="status">
                                    <span class="visually-hidden">Cargando...</span>
                                </div>
                            </div>
                        `,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        allowEnterKey: false,
                        showConfirmButton: false,
                        backdrop: true,
                        width: 500,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });
                });

                this.room.onMessage("error", (error) => {
                    Swal.fire({
                        title: "Error",
                        text: error.mensaje || "Hubo un problema con el registro",
                        icon: "error",
                        confirmButtonText: "Reintentar"
                    });
                });
            }
        });
    }

    mostrarRankingFinal(data, tipo) {
        console.log(`🎯 Partida terminada (${tipo}):`, data);
        
        const titulo = tipo === "completado" 
            ? "🏆 Partida Completada" 
            : "⏰ Partida Finalizada - Tiempo Agotado";
        
        const subtitulo = tipo === "completado"
            ? "Todos los jugadores han completado el juego"
            : "El tiempo se ha agotado para todos los jugadores";

        const html = `
            <div class="text-start">
                <h5>${titulo}</h5>
                <p class="text-muted">${subtitulo}</p>
                
                <div class="ranking-list">
                    ${data.ranking.map(jugador => `
                        <div class="d-flex justify-content-between align-items-center mb-2 
                                    ${jugador.esGanador ? 'text-success fw-bold border border-success p-2 rounded' : ''}
                                    ${!jugador.completado ? 'text-muted' : ''}">
                            <span>
                                ${jugador.posicion}. ${jugador.nombre}
                            </span>
                            <span>${jugador.tiempo} seg</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        Swal.close();
        Swal.fire({
            title: "Partida Finalizada",
            html: html,
            confirmButtonText: "Volver al inicio",
            allowOutsideClick: false,
            width: 500
        }).then((result) => {
            this.room.leave();
            this.reiniciarJuego();
        });
    }

    async create() {
        // Fondo adaptado a la pantalla
        this.background = this.add.image(0, 0, 'background_game');
        resizeBackground(this.background, this.cameras.main, 'cover');
        setupResizeListener(this, this.background, 'cover');
        
        // Usamos las coordenadas del centro de la cámara
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Escuchar ganador
        this.room = await this.client.joinOrCreate("memorama");

        this.crearFormulario();
        
        // Cuando el servidor mande "start"
        this.room.onMessage("start", () => {
            if (this.juegoIniciado) return; // evitar doble ejecución
            Swal.close();
            this.juegoIniciado = true;
            this.iniciarJuego();
        });
        
        this.room.onMessage("memorama_completado", async ({ sessionId, jugador, tiempo }) => {
            if (this.room.sessionId === sessionId) {
                await Swal.close();              
                Swal.fire({
                    title: "Participación guardada! 🎉",
                    html: `
                        <div class="text-center">
                            <p>Felicidades. Has resuelto el memorama en ${tiempo} segundos!</p>
                            <p>Esperando a que termine la partida...</p>
                        </div>
                    `,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false,
                    showConfirmButton: false,
                    backdrop: true,
                    width: 500,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
            }
        });

        this.room.onMessage("todosTerminaron", (data) => {
            this.mostrarRankingFinal(data, "completado");
        });

        this.room.onMessage("partidaFinalizada", (data) => {
            this.mostrarRankingFinal(data, "tiempo_fuera");
        });

    }
}
