/*
  Warnings:

  - You are about to drop the column `telefono` on the `jugador` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Jugador` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Jugador` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `jugador` DROP COLUMN `telefono`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Jugador_email_key` ON `Jugador`(`email`);
