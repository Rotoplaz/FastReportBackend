-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_supervisorId_fkey";

-- AlterTable
ALTER TABLE "Department" ALTER COLUMN "supervisorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
