-- CreateTable
CREATE TABLE `Jugador` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `sucursal` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Participacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tiempo` VARCHAR(191) NOT NULL,
    `fecha` VARCHAR(191) NOT NULL,
    `jugadorId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Participacion` ADD CONSTRAINT `Participacion_jugadorId_fkey` FOREIGN KEY (`jugadorId`) REFERENCES `Jugador`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
