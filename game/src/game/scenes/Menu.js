import { Scene } from 'phaser';
import { resizeBackground, setupResizeListener } from '../helpers/resizeHelper.js';

export class Menu extends Scene {
    constructor() {
        super('Menu');
    }

    preload() {
        // Cargas normales
        // this.load.image('background_game', 'assets/background.png');
        this.load.image('logo', 'assets/logo.png');
        this.load.spritesheet('ship', 'assets/ship.png', { frameWidth: 64, frameHeight: 64 });
    }

    create() {
        console.log("Menu listo");
        
        const { width, height } = this.scale;
        this.background = this.add.image(0, 0, 'background_game');
        resizeBackground(this.background, this.cameras.main, 'cover');
        setupResizeListener(this, this.background, 'cover');

        const logo = this.add.image(width/2, 200, 'logo');
        const ship = this.add.sprite(width/2, 360, 'ship');

        ship.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('ship', { start: 0, end: 2 }),
            frameRate: 15,
            repeat: -1
        });

        ship.play('fly');

        this.tweens.add({
            targets: logo,
            y: 400,
            duration: 1500,
            ease: 'Sine.inOut',
            yoyo: true,
            loop: -1
        });

        const form = this.add.dom(width/2, height - 600).createFromCache('formulario')
        .setOrigin(0.5)
        .setScale(2);
        
        form.addListener('submit');
        form.on('submit', (event) => {
            event.preventDefault();

            const nombre = form.getChildByID('playerName').value;
            const sucursal = form.getChildByID('playerSucursal').value;

            this.scene.start('Memorama', {nombre, sucursal});
        });
    }

    update() {
        // Si quieres un fondo tipo tile, usa TileSprite en vez de image
        // Aquí tu background no tiene propiedad tilePositionX
        // this.background.tilePositionX += 2;
    }
}
