-- CreateTable
CREATE TABLE "Asignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Asignment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Asignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
