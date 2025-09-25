// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }
    
    preload() {
        this.load.image('boot_logo', 'assets/techmeetings.png');
    }

    create() {
        const { width, height } = this.scale;

        const logo = this.add.image(width/2, height/2, 'boot_logo');
        logo.setScale(0.4); // Escala proporcional (40% del tamaño original)
        logo.setOrigin(0.5, 0.5); // Centrado (por si la imagen no estaba centrada)

        this.time.delayedCall(1500, () => {
            this.scene.start('Preloader');
        });
    }
}
