/*
  Warnings:

  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `students` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "admins" DROP CONSTRAINT "admins_basicDetailsFk_fkey";

-- DropForeignKey
ALTER TABLE "notice" DROP CONSTRAINT "notice_adminDetailsId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_basicDetailsFk_fkey";

-- DropTable
DROP TABLE "admins";

-- DropTable
DROP TABLE "students";

-- CreateTable
CREATE TABLE "student_detail" (
    "id" TEXT NOT NULL,
    "basicDetailsFk" TEXT NOT NULL,
    "registrationNumber" INTEGER NOT NULL DEFAULT 0,
    "year" INTEGER,
    "branch" TEXT,

    CONSTRAINT "student_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_detail" (
    "id" TEXT NOT NULL,
    "basicDetailsFk" TEXT NOT NULL,

    CONSTRAINT "admin_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_detail_basicDetailsFk_key" ON "student_detail"("basicDetailsFk");

-- CreateIndex
CREATE UNIQUE INDEX "admin_detail_basicDetailsFk_key" ON "admin_detail"("basicDetailsFk");

-- AddForeignKey
ALTER TABLE "student_detail" ADD CONSTRAINT "student_detail_basicDetailsFk_fkey" FOREIGN KEY ("basicDetailsFk") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_detail" ADD CONSTRAINT "admin_detail_basicDetailsFk_fkey" FOREIGN KEY ("basicDetailsFk") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notice" ADD CONSTRAINT "notice_adminDetailsId_fkey" FOREIGN KEY ("adminDetailsId") REFERENCES "admin_detail"("id") ON DELETE SET NULL ON UPDATE CASCADE;
