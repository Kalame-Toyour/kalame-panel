/*
  Warnings:

  - You are about to drop the column `created_at` on the `learning__book` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `learning__book` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `learning__lessons` table. All the data in the column will be lost.
  - You are about to drop the column `lesson_plan` on the `learning__lessons` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `learning__lessons` table. All the data in the column will be lost.
  - You are about to drop the column `week_id` on the `learning__lessons` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `learning__model_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `learning__model_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `user_comment` on the `learning__model_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `user_rating` on the `learning__model_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `learning__questions` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty` on the `learning__questions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `learning__questions` table. All the data in the column will be lost.
  - Added the required column `answer_file_id` to the `learning__book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exam_order` to the `learning__book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exam_pic_url` to the `learning__book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_shaire` to the `learning__book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pic_url` to the `learning__book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `learning__book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `learning__book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tajrobi_zarib` to the `learning__book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `learning__book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zarib` to the `learning__book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `learning__lessons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `learning__model_interactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `book_id` to the `learning__questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `learning__questions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `learning__book` DROP COLUMN `created_at`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `answer_file_id` INTEGER NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `exam_order` INTEGER NOT NULL,
    ADD COLUMN `exam_pic_url` VARCHAR(191) NOT NULL,
    ADD COLUMN `have_practice` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `is_shaire` INTEGER NOT NULL,
    ADD COLUMN `parent` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `pic_url` VARCHAR(191) NOT NULL,
    ADD COLUMN `price` INTEGER NOT NULL,
    ADD COLUMN `sample_video_id` INTEGER NULL,
    ADD COLUMN `school_id` INTEGER NOT NULL,
    ADD COLUMN `show_status` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `tajrobi_zarib` INTEGER NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `zarib` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `learning__lessons` DROP COLUMN `created_at`,
    DROP COLUMN `lesson_plan`,
    DROP COLUMN `updated_at`,
    DROP COLUMN `week_id`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `learning__model_interactions` DROP COLUMN `created_at`,
    DROP COLUMN `updated_at`,
    DROP COLUMN `user_comment`,
    DROP COLUMN `user_rating`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `learning__questions` DROP COLUMN `created_at`,
    DROP COLUMN `difficulty`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `book_id` INTEGER NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `difficulty_level` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `correct_answer` VARCHAR(191) NOT NULL,
    MODIFY `explanation` TEXT NULL,
    MODIFY `question_hash` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `learning__questions` ADD CONSTRAINT `learning__questions_book_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `learning__book`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
