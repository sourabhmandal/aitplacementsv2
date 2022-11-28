/*
  Warnings:

  - The primary key for the `attachments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `attachments` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "attachments_fileid_key";

-- AlterTable
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "attachments_pkey" PRIMARY KEY ("fileid");
