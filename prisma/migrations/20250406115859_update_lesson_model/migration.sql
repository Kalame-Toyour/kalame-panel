/*
  Warnings:

  - Added the required column `order_id` to the `learning__lessons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parent` to the `learning__lessons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pic_url` to the `learning__lessons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week_id` to the `learning__lessons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `learning__lessons` ADD COLUMN `order_id` INTEGER NOT NULL,
    ADD COLUMN `parent` INTEGER NOT NULL,
    ADD COLUMN `pic_url` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
    ADD COLUMN `week_id` INTEGER NOT NULL;
