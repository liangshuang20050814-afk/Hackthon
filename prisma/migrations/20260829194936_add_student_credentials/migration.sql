-- AlterTable
ALTER TABLE "Student" ADD COLUMN "email" TEXT;
ALTER TABLE "Student" ADD COLUMN "passwordHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");
