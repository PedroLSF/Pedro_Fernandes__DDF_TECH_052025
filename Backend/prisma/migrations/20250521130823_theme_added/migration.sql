/*
  Warnings:

  - You are about to drop the column `text` on the `Plannings` table. All the data in the column will be lost.
  - Added the required column `theme` to the `Plannings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `theme` to the `essays` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Plannings` DROP COLUMN `text`,
    ADD COLUMN `theme` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `essays` ADD COLUMN `theme` LONGTEXT NOT NULL;
