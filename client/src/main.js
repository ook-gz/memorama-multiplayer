import { Boot } from './scenes/Boot.js';
import { Preloader } from './scenes/Preloader.js';
import { Menu } from './scenes/Menu.js';
import { Memorama } from './scenes/Memorama.js';

// Configuración del juego
const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 1920,
    backgroundColor: '#000000',
    parent: 'game-container', // contenedor en HTML
    scene: [Boot, Preloader, Menu, Memorama],
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    dom: {
        createContainer: true // necesario para los formularios HTML
    },
  scale: {
        mode: Phaser.Scale.FIT, // Ajusta el canvas dentro del contenedor
        autoCenter: Phaser.Scale.CENTER_BOTH, // Centra en horizontal y vertical
        width: 1080, // base lógica (más cómodo en vertical)
        height: 1920, // base lógica en vertical
        min: {
            width: 320,
            height: 480
        },



        
        max: {
            width: 1080,
            height: 1920
        },
        orientation: Phaser.Scale.Orientation.PORTRAIT // fuerza vertical
    }
};

// Crear el juego
const game = new Phaser.Game(config);