-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STUDENT');

-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ADMIN';

-- AlterTable
ALTER TABLE "verification_tokens" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'STUDENT';
