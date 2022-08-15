/*
  Warnings:

  - A unique constraint covering the columns `[registrationNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `branch` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registrationNumber` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `emailVerified` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "branch" TEXT NOT NULL,
ADD COLUMN     "registrationNumber" INTEGER NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL,
ALTER COLUMN "name" SET NOT NULL,
DROP COLUMN "emailVerified",
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_registrationNumber_key" ON "users"("registrationNumber");
