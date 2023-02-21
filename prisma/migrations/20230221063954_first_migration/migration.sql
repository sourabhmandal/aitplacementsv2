-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STUDENT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('INACTIVE', 'ACTIVE', 'INVITED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid()::TEXT),
    "name" TEXT,
    "email" TEXT NOT NULL,
    "phoneNo" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "userStatus" "UserStatus" NOT NULL DEFAULT 'INACTIVE',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "notice" (
    "id" TEXT NOT NULL,
    "adminEmailFk" TEXT NOT NULL,
    "tags" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminDetailsId" TEXT,

    CONSTRAINT "notice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "fileid" TEXT NOT NULL,
    "noticeid" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filetype" TEXT NOT NULL,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("fileid")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "student_detail_basicDetailsFk_key" ON "student_detail"("basicDetailsFk");

-- CreateIndex
CREATE UNIQUE INDEX "admin_detail_basicDetailsFk_key" ON "admin_detail"("basicDetailsFk");

-- CreateIndex
CREATE UNIQUE INDEX "attachments_fileid_key" ON "attachments"("fileid");

-- AddForeignKey
ALTER TABLE "student_detail" ADD CONSTRAINT "student_detail_basicDetailsFk_fkey" FOREIGN KEY ("basicDetailsFk") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_detail" ADD CONSTRAINT "admin_detail_basicDetailsFk_fkey" FOREIGN KEY ("basicDetailsFk") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notice" ADD CONSTRAINT "notice_adminEmailFk_fkey" FOREIGN KEY ("adminEmailFk") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notice" ADD CONSTRAINT "notice_adminDetailsId_fkey" FOREIGN KEY ("adminDetailsId") REFERENCES "admin_detail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_noticeid_fkey" FOREIGN KEY ("noticeid") REFERENCES "notice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
