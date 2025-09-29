export function crearLoader(scene, logo, options = {}) {
  const {
    width = 320,
    height = 50,
    offsetY = 100, // distancia debajo del logo
    text = 'Cargando...'
  } = options;

  // calcular posición en relación al logo
  let barX = logo.x - width / 2;
  let barY = logo.y + offsetY;

  // caja de fondo
  let progressBox = scene.add.graphics();
  progressBox.fillStyle(0x222222, 0.8);
  progressBox.fillRect(barX, barY, width, height);

  // barra
  let progressBar = scene.add.graphics();

  // texto centrado
  let loadingText = scene.add.text(logo.x, barY + height / 2, text, {
    fontSize: '20px',
    fill: '#ffffff'
  }).setOrigin(0.5);

  // eventos de carga
  scene.load.on('progress', (value) => {
    progressBar.clear();
    progressBar.fillStyle(0xffffff, 1);
    progressBar.fillRect(barX + 10, barY + 10, (width - 20) * value, height - 20);
  });

  scene.load.on('complete', () => {
    progressBar.destroy();
    progressBox.destroy();
    loadingText.destroy();
  });
}