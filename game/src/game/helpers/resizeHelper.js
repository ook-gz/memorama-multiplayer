export const resizeBackground = (background, camera, mode = 'cover') => {
    switch (mode) {
        case 'cover':
            const coverScale = Math.max(
                camera.width / background.width,
                camera.height / background.height
            );
            background.setScale(coverScale);
            break;
            
        case 'contain':
            const containScale = Math.min(
                camera.width / background.width,
                camera.height / background.height
            );
            background.setScale(containScale);
            break;
            
        case 'fill':
            background.setDisplaySize(camera.width, camera.height);
            break;
            
        default:
            const scale = Math.max(
                camera.width / background.width,
                camera.height / background.height
            );
            background.setScale(scale);
    }
    
    background.setPosition(camera.centerX, camera.centerY);
    return background;
};

export const setupResizeListener = (scene, background, mode = 'cover') => {
    const resizeCallback = () => {
        resizeBackground(background, scene.cameras.main, mode);
    };
    
    scene.scale.on('resize', resizeCallback, scene);
    
    // Guardar referencia para poder removerlo después
    scene.resizeCallbacks = scene.resizeCallbacks || [];
    scene.resizeCallbacks.push({ callback: resizeCallback, event: 'resize' });
    
    return resizeCallback;
};

// Función adicional para crear fondo con resize automático
export const createResizableBackground = (scene, textureKey, mode = 'cover') => {
    const background = scene.add.image(
        scene.cameras.main.centerX,
        scene.cameras.main.centerY,
        textureKey
    );
    
    resizeBackground(background, scene.cameras.main, mode);
    setupResizeListener(scene, background, mode);
    
    return background;
};

export const getResponsiveFontSize = (baseSize = 40, scale) => {
    const baseWidth = 960; // Tu ancho base de diseño
    const scaleFactor = scale / baseWidth;
    return Math.max(24, baseSize * scaleFactor); // Mínimo 24px para legibilidad
}