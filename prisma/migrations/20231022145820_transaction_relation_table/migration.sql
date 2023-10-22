/*
  Warnings:

  - You are about to drop the `_productshelftotransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_productshelftotransaction` DROP FOREIGN KEY `_ProductShelfToTransaction_A_fkey`;

-- DropForeignKey
ALTER TABLE `_productshelftotransaction` DROP FOREIGN KEY `_ProductShelfToTransaction_B_fkey`;

-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `productShelfShelfItemId` INTEGER NULL;

-- DropTable
DROP TABLE `_productshelftotransaction`;

-- CreateTable
CREATE TABLE `transaction_to_product_shelf` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantity` INTEGER NOT NULL,
    `productShelfId` INTEGER NOT NULL,
    `transactionId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_productShelfShelfItemId_fkey` FOREIGN KEY (`productShelfShelfItemId`) REFERENCES `shelves`(`shelfItemId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_to_product_shelf` ADD CONSTRAINT `transaction_to_product_shelf_productShelfId_fkey` FOREIGN KEY (`productShelfId`) REFERENCES `shelves`(`shelfItemId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_to_product_shelf` ADD CONSTRAINT `transaction_to_product_shelf_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`transactionId`) ON DELETE RESTRICT ON UPDATE CASCADE;
