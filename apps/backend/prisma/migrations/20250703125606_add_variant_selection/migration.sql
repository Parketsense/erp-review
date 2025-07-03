-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_phase_variants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phaseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "variantOrder" INTEGER NOT NULL DEFAULT 1,
    "designer" TEXT,
    "architect" TEXT,
    "architectCommission" REAL DEFAULT 0,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "includeInOffer" BOOLEAN NOT NULL DEFAULT true,
    "discountEnabled" BOOLEAN NOT NULL DEFAULT true,
    "variantDiscount" REAL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "phase_variants_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "project_phases" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_phase_variants" ("architect", "architectCommission", "createdAt", "description", "designer", "discountEnabled", "id", "includeInOffer", "name", "phaseId", "updatedAt", "variantDiscount", "variantOrder") SELECT "architect", "architectCommission", "createdAt", "description", "designer", "discountEnabled", "id", "includeInOffer", "name", "phaseId", "updatedAt", "variantDiscount", "variantOrder" FROM "phase_variants";
DROP TABLE "phase_variants";
ALTER TABLE "new_phase_variants" RENAME TO "phase_variants";
CREATE UNIQUE INDEX "phase_variants_phaseId_variantOrder_key" ON "phase_variants"("phaseId", "variantOrder");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
