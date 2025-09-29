export const crearCartas = ({
    scene,
    x,
    y,
    frontTexture,
    cardName
}) => {
    let isFlipping = false;
    const backTexture = "reverso";

    const CARD_WIDTH = 200;
    const CARD_HEIGHT = 280;

    // Crear carta con tamaño fijo
    const card = scene.add.image(x, y, backTexture)
        .setName(cardName)
        .setInteractive();
    
    card.setDisplaySize(CARD_WIDTH, CARD_HEIGHT);

    const flipCard = (callbackComplete) => {
        if (isFlipping) return;
        isFlipping = true;

        scene.tweens.add({
            targets: card,
            scaleX: 0.36,
            duration: 200,
            ease: "Linear",
            onComplete: () => {
                // Cambiar textura al llegar al "cierre"
                if (card.texture.key === backTexture) {
                    card.setTexture(frontTexture);
                } else {
                    card.setTexture(backTexture);
                }
                
                card.setDisplaySize(CARD_WIDTH, CARD_HEIGHT);
                // card.setDisplaySize(CARD_WIDTH, CARD_HEIGHT);

                // Reabrir la carta
                scene.tweens.add({
                    targets: card,
                    scaleX: 0.36,
                    duration: 200,
                    ease: "Linear",
                    onComplete: () => {
                        isFlipping = false;
                        if (callbackComplete) callbackComplete();
                    }
                });
            }
        });
    };

    const destroy = () => {
        scene.tweens.add({
            targets: card,
            y: card.y - 1000,
            ease: "Back.easeIn",
            duration: 500,
            onComplete: () => {
                card.destroy();
            }
        });
    };

    return {
        gameObject: card,
        flip: flipCard,
        destroy,
        cardName
    };
};
