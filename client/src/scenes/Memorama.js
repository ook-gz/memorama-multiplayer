import { resizeBackground, setupResizeListener, getResponsiveFontSize } from '../helpers/resizeHelper.js';
import { crearCartas } from '../helpers/crearCartas.js';
import { Client } from 'colyseus.js';

export class Memorama extends Phaser.Scene {

    cartasNombres = [
        "card1","card2","card3", "card4", "card5", "card6", "card7", "card8", "card9"
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
        
        this.tiempoRestante = 45; // segundos de cuenta regresiva
        this.tiempoTexto;         // texto en pantalla
        this.paresTexto;         // texto en pantalla
        this.temporizador;        // evento de Phaser

        this.pares_completados = 0;
        this.totalPares = 0;

        this.puedeJugar = false;

        this.juegoIniciado = false;
        
        this.client = new Client("http://192.168.0.27:2567");

              // 🔹 limpiar al cerrar escena
        this.events.on("shutdown", () => {
            if (this.room) {
                this.room.removeAllListeners();
                this.room._listenersRegistered = false;
            }
            this.input.removeAllListeners();
            this.detenerTemporizador();
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
        
        this.paresTexto = this.add.text(this.sys.game.scale.width - 480, 30, `Pares encontrados: ${this.pares_completados}/6`, {
            fontSize: `${getResponsiveFontSize(32, this.sys.game.scale.width)}px`,
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
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
        
        this.tiempoRestante = 45;
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

    iniciarJuego() {
        console.log("iniciarJuego");

        const winnerText = this.add.text(this.sys.game.scale.width / 2, -1000, "Ganaste", {
            align: "center", strokeThickness: 4, fontSize: `${getResponsiveFontSize(40, this.sys.game.scale.width)}px`, fontStyle: "bold", color: "#8c7ae6"
        }).setOrigin(.5).setDepth(3).setInteractive();

        const gameOverText = this.add.text(this.sys.game.scale.width / 2, -1000, "EL TIEMPO TERMINÓ\ntoque la pantalla para continuar", {
            align: "center", strokeThickness: 4, fontSize: `${getResponsiveFontSize(40, this.sys.game.scale.width)}px`, fontStyle: "bold", color: "#ff0000"
        }).setOrigin(.5).setDepth(3).setInteractive();

        // Crear cartas
        this.cartas = this.crearContenedorCartas();
        
        // Texto del tiempo (arriba a la derecha)
        this.tiempoTexto = this.add.text(this.sys.game.scale.width - 30, 30, `Tiempo: ${this.tiempoRestante}`, {
            fontSize: `${getResponsiveFontSize(32, this.sys.game.scale.width)}px`,
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(1, 0).setDepth(5);

        // Evento que resta tiempo cada segundo
        this.temporizador = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
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

                    this.add.tween({ 
                        targets: gameOverText, 
                        ease: Phaser.Math.Easing.Bounce.Out, 
                        y: this.sys.game.scale.height / 2 
                    });
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
                        this.add.tween({ targets: winnerText, ease: Phaser.Math.Easing.Bounce.Out, y: this.sys.game.scale.height / 2 });
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

        // reinicios
        winnerText.on(Phaser.Input.Events.POINTER_DOWN, () => this.reiniciarJuego());
        gameOverText.on(Phaser.Input.Events.POINTER_DOWN, () => this.reiniciarJuego());
    }

    crearFormulario() {
        // Insertar el formulario en Phaser
        const posicionInicialForm = -500;
        const element = this.add.dom(this.cameras.main.centerX, posicionInicialForm)
        .createFromCache('formulario')
        .setScale(1.5);
        // Manejo de submit
        this.tweens.add({
            targets: element,
            x: this.cameras.main.centerX,
            y: this.cameras.main.centerY,
            duration: 800,
            repeat: 0,
        });

        const form = element.getChildByID("player-form");
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const data = new FormData(form);

            const nombre = data.get("nombre");
            const sucursal = data.get("sucursal");
            const telefono = data.get("telefono");

            // Enviar a Colyseus
            this.room.send("registrar", { nombre, sucursal, telefono });

            this.room.onMessage("registrado", () => {
                console.log("Bienvenido: ", nombre)
                this.tweens.add({
                    targets: element,
                    x: this.cameras.main.centerX,
                    y: posicionInicialForm,
                    duration: 800,
                    repeat: 0,
                });
            });

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

        const mensajeEspera = this.add.text(
            centerX,
            centerY,
            "Presione para iniciar el juego",
            {
                align: "center",
                strokeThickness: 4,
                fontSize: `${getResponsiveFontSize(40, this.sys.game.scale.width)}px`,
                fontStyle: "bold",
                color: "#8c7ae6"
            }
        ).setOrigin(0.5).setDepth(10).setInteractive();
        
        this.add.tween({
            targets: mensajeEspera,
            duration: 800,
            alpha: 0,
            yoyo: true,
            repeat: -1
        });

        this.crearFormulario();
        
        const btnReady = this.add.text(
            centerX,
            centerY + 100, // debajo del mensaje
            "Listo",
            { fontSize: `${getResponsiveFontSize(63, this.sys.game.scale.width)}px`, color: "#0f0" }
        ).setOrigin(0.5).setDepth(10).setInteractive();
        
        // Escuchar ganador
        this.room = await this.client.joinOrCreate("memorama");
        
        btnReady.on("pointerdown", () => {
            this.room.send("ready");
            btnReady.setText("✔️ Esperando...");
        });
        
        // Cuando el servidor mande "start"
        this.room.onMessage("start", () => {
            if (this.juegoIniciado) return; // evitar doble ejecución
            this.juegoIniciado = true;
            
            this.add.tween({
                targets: [btnReady, mensajeEspera],
                ease: Phaser.Math.Easing.Bounce.InOut,
                y: -1000,
                onComplete: () => {
                    this.juegoIniciado = true;
                    this.iniciarJuego();
                }
            });
        });

        this.room.onMessage("ganador", ({ jugador, tiempo }) => {
            if (this.room.sessionId === jugador) {
                alert(`🎉 ¡Ganaste en ${tiempo} segundos!`);
            } else {
                alert(`😢 El jugador ${jugador} ganó en ${tiempo} segundos`);
            }
            this.reiniciarJuego();
        });


    }
}
