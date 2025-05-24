/*
  Warnings:

  - You are about to drop the column `created_at` on the `learning__field` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `learning__field` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `learning__year` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `learning__year` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `learning__field` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `learning__year` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `learning__field` DROP COLUMN `created_at`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `learning__lessons` ADD COLUMN `lesson_plan` TEXT NULL;

-- AlterTable
ALTER TABLE `learning__year` DROP COLUMN `created_at`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `name_en` VARCHAR(191) NULL;
