/*
  Warnings:

  - The primary key for the `learning__book` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `learning__book` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `learning__book` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `learning__book` table. All the data in the column will be lost.
  - The primary key for the `learning__field` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `learning__field` table. All the data in the column will be lost.
  - The primary key for the `learning__lessons` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `learning__lessons` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `learning__lessons` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `learning__lessons` table. All the data in the column will be lost.
  - The primary key for the `learning__model_interactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `learning__model_interactions` table. All the data in the column will be lost.
  - The primary key for the `learning__questions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `learning__questions` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `learning__questions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `learning__questions` table. All the data in the column will be lost.
  - The primary key for the `learning__year` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `learning__year` table. All the data in the column will be lost.
  - Added the required column `ID` to the `learning__book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID` to the `learning__field` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID` to the `learning__lessons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID` to the `learning__model_interactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID` to the `learning__questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID` to the `learning__year` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `learning__book` DROP FOREIGN KEY `learning__book_field_id_fkey`;

-- DropForeignKey
ALTER TABLE `learning__book` DROP FOREIGN KEY `learning__book_year_id_fkey`;

-- DropForeignKey
ALTER TABLE `learning__lessons` DROP FOREIGN KEY `learning__lessons_book_id_fkey`;

-- DropForeignKey
ALTER TABLE `learning__model_interactions` DROP FOREIGN KEY `learning__model_interactions_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `learning__questions` DROP FOREIGN KEY `learning__questions_book_id_fkey`;

-- DropForeignKey
ALTER TABLE `learning__questions` DROP FOREIGN KEY `learning__questions_lesson_id_fkey`;

-- The following DROP INDEX and DROP COLUMN statements are commented out to avoid errors
-- DROP INDEX `learning__book_field_id_fkey` ON `learning__book`;
-- DROP INDEX `learning__book_year_id_fkey` ON `learning__book`;
-- DROP INDEX `learning__lessons_book_id_fkey` ON `learning__lessons`;
-- DROP INDEX `learning__model_interactions_question_id_fkey` ON `learning__model_interactions`;
-- DROP INDEX `learning__questions_book_id_fkey` ON `learning__questions`;
-- DROP INDEX `learning__questions_lesson_id_fkey` ON `learning__questions`;

-- The following ALTER TABLE statements that drop columns or primary keys are commented out
-- ALTER TABLE `learning__book` DROP PRIMARY KEY, DROP COLUMN `createdAt`, DROP COLUMN `id`, DROP COLUMN `updatedAt`, ADD COLUMN `ID` INTEGER NOT NULL AUTO_INCREMENT, MODIFY `name` VARCHAR(255) NOT NULL, MODIFY `exam_pic_url` VARCHAR(255) NOT NULL, MODIFY `pic_url` VARCHAR(255) NOT NULL, ADD PRIMARY KEY (`ID`);
-- ALTER TABLE `learning__field` DROP PRIMARY KEY, DROP COLUMN `id`, ADD COLUMN `ID` INTEGER NOT NULL AUTO_INCREMENT, MODIFY `name` VARCHAR(255) NOT NULL, ADD PRIMARY KEY (`ID`);
-- ALTER TABLE `learning__lessons` DROP PRIMARY KEY, DROP COLUMN `createdAt`, DROP COLUMN `id`, DROP COLUMN `updatedAt`, ADD COLUMN `ID` INTEGER NOT NULL AUTO_INCREMENT, MODIFY `name` VARCHAR(255) NOT NULL, MODIFY `pic_url` VARCHAR(255) NOT NULL, ADD PRIMARY KEY (`ID`);
-- ALTER TABLE `learning__model_interactions` DROP PRIMARY KEY, DROP COLUMN `id`, ADD COLUMN `ID` INTEGER NOT NULL AUTO_INCREMENT, ADD PRIMARY KEY (`ID`);
-- ALTER TABLE `learning__questions` DROP PRIMARY KEY, DROP COLUMN `createdAt`, DROP COLUMN `id`, DROP COLUMN `updatedAt`, ADD COLUMN `ID` INTEGER NOT NULL AUTO_INCREMENT, ADD COLUMN `has_image` BOOLEAN NOT NULL DEFAULT false, ADD COLUMN `image_description` TEXT NULL, ADD COLUMN `image_url` VARCHAR(191) NULL, ADD PRIMARY KEY (`ID`);
-- ALTER TABLE `learning__year` DROP PRIMARY KEY, DROP COLUMN `id`, ADD COLUMN `ID` INTEGER NOT NULL AUTO_INCREMENT, MODIFY `name` VARCHAR(255) NOT NULL, MODIFY `name_en` VARCHAR(255) NULL, ADD PRIMARY KEY (`ID`);

-- Only keep the following if you are sure the columns do not exist yet, otherwise add them manually if needed
ALTER TABLE `learning__questions` ADD COLUMN `has_image` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `learning__questions` ADD COLUMN `image_description` TEXT NULL;
ALTER TABLE `learning__questions` ADD COLUMN `image_url` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `learning__book` ADD CONSTRAINT `learning__book_field_id_fkey` FOREIGN KEY (`field_id`) REFERENCES `learning__field`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `learning__book` ADD CONSTRAINT `learning__book_year_id_fkey` FOREIGN KEY (`year_id`) REFERENCES `learning__year`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `learning__lessons` ADD CONSTRAINT `learning__lessons_book_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `learning__book`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `learning__questions` ADD CONSTRAINT `learning__questions_book_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `learning__book`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `learning__questions` ADD CONSTRAINT `learning__questions_lesson_id_fkey` FOREIGN KEY (`lesson_id`) REFERENCES `learning__lessons`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `learning__model_interactions` ADD CONSTRAINT `learning__model_interactions_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `learning__questions`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `learning__questions_book_id_idx` ON `learning__questions`(`book_id`);
CREATE INDEX `learning__questions_lesson_id_idx` ON `learning__questions`(`lesson_id`);
