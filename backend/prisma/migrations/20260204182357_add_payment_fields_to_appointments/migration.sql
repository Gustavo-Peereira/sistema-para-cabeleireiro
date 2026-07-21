-- AlterTable
ALTER TABLE `appointments` ADD COLUMN `paid` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `paymentMethod` ENUM('PIX', 'CARD', 'CASH') NULL;
