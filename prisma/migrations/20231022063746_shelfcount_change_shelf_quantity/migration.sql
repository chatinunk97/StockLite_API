/*
  Warnings:

  - You are about to drop the column `shelfCount` on the `shelves` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `shelves` DROP COLUMN `shelfCount`,
    ADD COLUMN `shelfQuantity` INTEGER NULL;
