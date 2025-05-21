/*
  Warnings:

  - Added the required column `text` to the `Plannings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Plannings` ADD COLUMN `text` LONGTEXT NOT NULL;
