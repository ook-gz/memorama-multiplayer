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
        this.load.image('background_game', 'assets/fondo.jpg');
        this.load.html('formulario', 'assets/components/form.html');

        //Cartas
        this.load.image('reverso', 'assets/reverso.jpg');
        this.load.image('reverso3', 'assets/reverso3.jpg');


        this.load.image('card1', 'assets/cartas/02-Slogan-ultra.jpg');
        this.load.image('card2', 'assets/cartas/03-El-Éxito-de-tu-marca.jpg');
        this.load.image('card3', 'assets/cartas/04-Logo-FA.jpg');
        this.load.image('card4', 'assets/cartas/05-Losartán.jpg');
        this.load.image('card5', 'assets/cartas/06-Dexlasoprazol.jpg');
        this.load.image('card6', 'assets/cartas/09-Vildagliptina_Metfor.jpg');
        this.load.image('card7', 'assets/cartas/10-Desvenlafaxina.jpg');
        this.load.image('card8', 'assets/cartas/11-Acemetacina.jpg');
        this.load.image('card9', 'assets/cartas/04-Sildenafil.jpg');
        this.load.image('card10', 'assets/cartas/01-Logo-Ultra.jpg');

        this.load.font('vcr mono', 'assets/fonts/VCR_OSD_MONO_1.001.ttf');
    }

    create() {
        this.scene.start('Memorama');
    }

}
