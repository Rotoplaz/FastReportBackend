-- AlterTable
ALTER TABLE "User" ADD COLUMN     "categoryId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
