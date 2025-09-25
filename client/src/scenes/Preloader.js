import { crearLoader } from '../helpers/crearLoader.js';

export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        const { width, height } = this.scale;

        // Fondo blanco en toda la escena
        this.cameras.main.setBackgroundColor('#ffffff');

        // Logo reducido al 40% y centrado
        const logo = this.add.image(width/2, height/2, 'boot_logo');
        logo.setScale(0.4); // Escala proporcional (40% del tamaño original)
        logo.setOrigin(0.5, 0.5); // Centrado (por si la imagen no estaba centrada)

        
        
        // crear barra debajo del logo
        crearLoader(this, logo, {
            width: 320,
            height: 50,
            offsetY: 100,
            text: 'Cargando...'
        });

    }

    preload() {
        // this.load.image('background', 'assets/space.png');
        this.load.image('logo', 'assets/phaser.png');
        this.load.spritesheet('ship', 'assets/spaceship.png', { frameWidth: 176, frameHeight: 96 });

        this.load.image('background_game', 'assets/fondo.jpg');
        this.load.html("formulario", "assets/components/form.html");

        //Cartas
        this.load.image('reverso', 'assets/reverso_carta.png');
        this.load.image('card1', 'assets/cartas/delsey_img.png');
        this.load.image('card2', 'assets/cartas/diapro_img.png');
        this.load.image('card3', 'assets/cartas/escudo_img.png');
        this.load.image('card4', 'assets/cartas/evenflo_img.png');
        this.load.image('card5', 'assets/cartas/kleenbebe_img.png');
        this.load.image('card6', 'assets/cartas/kleenex_img.png');
        this.load.image('card7', 'assets/cartas/kotex_img.png');
        this.load.image('card8', 'assets/cartas/petalo_img.png');
    }
        

    create() {
        this.scene.start('Memorama');
    }

}
