-- Volcando estructura para tabla memorama_ultralabo.jugador
CREATE TABLE IF NOT EXISTS `jugador` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sucursal` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`)
);
-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla memorama_ultralabo.participacion
CREATE TABLE IF NOT EXISTS `participacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tiempo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jugadorId` int NOT NULL,
  `sessionId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Participacion_jugadorId_fkey` (`jugadorId`),
  CONSTRAINT `Participacion_jugadorId_fkey` FOREIGN KEY (`jugadorId`) REFERENCES `jugador` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);