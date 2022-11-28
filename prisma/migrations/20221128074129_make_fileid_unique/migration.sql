/*
  Warnings:

  - A unique constraint covering the columns `[fileid]` on the table `attachments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "attachments_fileid_key" ON "attachments"("fileid");
