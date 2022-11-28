/*
  Warnings:

  - The primary key for the `attachments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fileid` on the `attachments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[filepath]` on the table `attachments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `filepath` to the `attachments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_pkey",
DROP COLUMN "fileid",
ADD COLUMN     "filepath" TEXT NOT NULL,
ADD CONSTRAINT "attachments_pkey" PRIMARY KEY ("filepath");

-- CreateIndex
CREATE UNIQUE INDEX "attachments_filepath_key" ON "attachments"("filepath");
