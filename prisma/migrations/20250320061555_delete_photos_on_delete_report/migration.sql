-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Photos_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Photos" ("createdAt", "id", "reportId", "updatedAt", "url") SELECT "createdAt", "id", "reportId", "updatedAt", "url" FROM "Photos";
DROP TABLE "Photos";
ALTER TABLE "new_Photos" RENAME TO "Photos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
