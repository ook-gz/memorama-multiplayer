/*
  Warnings:

  - Added the required column `sessionId` to the `Participacion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `participacion` ADD COLUMN `sessionId` VARCHAR(191) NOT NULL;
