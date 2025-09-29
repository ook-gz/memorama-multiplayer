import { Scene } from 'phaser';
import { crearLoader } from '../helpers/crearLoader.js';

export class Preloader extends Scene {
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

        this.load.image('background_game', 'assets/fondo.jpg');
        this.load.html('formulario', 'assets/components/form.html');

        //Cartas
        this.load.image('reverso', 'assets/reverso.jpg');
        this.load.image('card1', 'assets/cartas/carta1.jpg');
        this.load.image('card2', 'assets/cartas/carta2.jpg');
        this.load.image('card3', 'assets/cartas/carta3.jpg');
        this.load.image('card4', 'assets/cartas/carta4.jpg');
        this.load.image('card5', 'assets/cartas/carta5.jpg');
        this.load.image('card6', 'assets/cartas/carta6.jpg');
        this.load.image('card7', 'assets/cartas/carta7.jpg');
        this.load.image('card8', 'assets/cartas/carta8.jpg');
        this.load.image('card9', 'assets/cartas/carta9.jpg');
        this.load.image('card10', 'assets/cartas/carta10.jpg');

        this.load.font('vcr mono', 'assets/fonts/VCR_OSD_MONO_1.001.ttf');
    }

    create() {
        
        const texturesToCheck = ['card1', 'card2', 'card3', 'card4', 'card5', 'card6', 'card7', 'card8', 'card9', 'card10', 'reverso', 'background_game'];
        const allTexturesLoaded = texturesToCheck.every(texture => this.textures.exists(texture));
        
        if (allTexturesLoaded) {
            console.log('Todas las texturas cargadas, iniciando Memorama');
            this.scene.start('Memorama');
        } else {
            console.error('Faltan texturas:', texturesToCheck.filter(t => !this.textures.exists(t)));
            // Reintentar después de un breve delay
            this.time.delayedCall(500, () => {
                this.scene.start('Memorama');
            });
        }
        // this.scene.start('Memorama');
    }

}
