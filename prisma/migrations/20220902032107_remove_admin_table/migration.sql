/*
  Warnings:

  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notice" DROP CONSTRAINT "Notice_adminEmail_fkey";

-- DropIndex
DROP INDEX "users_registrationNumber_key";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "registrationNumber" SET DEFAULT 0,
ALTER COLUMN "emailVerified" SET DEFAULT false;

-- DropTable
DROP TABLE "admins";

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_adminEmail_fkey" FOREIGN KEY ("adminEmail") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
