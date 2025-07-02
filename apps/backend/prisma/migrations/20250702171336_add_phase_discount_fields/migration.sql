-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_project_phases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "phaseOrder" INTEGER NOT NULL DEFAULT 1,
    "includeArchitectCommission" BOOLEAN NOT NULL DEFAULT false,
    "discountEnabled" BOOLEAN NOT NULL DEFAULT false,
    "phaseDiscount" REAL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'created',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "project_phases_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_project_phases" ("createdAt", "description", "id", "includeArchitectCommission", "name", "phaseOrder", "projectId", "status", "updatedAt") SELECT "createdAt", "description", "id", "includeArchitectCommission", "name", "phaseOrder", "projectId", "status", "updatedAt" FROM "project_phases";
DROP TABLE "project_phases";
ALTER TABLE "new_project_phases" RENAME TO "project_phases";
CREATE UNIQUE INDEX "project_phases_projectId_phaseOrder_key" ON "project_phases"("projectId", "phaseOrder");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
