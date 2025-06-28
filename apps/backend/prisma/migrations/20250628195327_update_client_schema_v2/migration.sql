/*
  Warnings:

  - You are about to drop the column `contactPerson` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `eik` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `mol` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `clients` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `clients` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_clients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "hasCompany" BOOLEAN NOT NULL DEFAULT false,
    "companyName" TEXT,
    "eikBulstat" TEXT,
    "vatNumber" TEXT,
    "companyAddress" TEXT,
    "companyPhone" TEXT,
    "companyEmail" TEXT,
    "companyMol" TEXT,
    "isArchitect" BOOLEAN NOT NULL DEFAULT false,
    "commissionPercent" REAL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    CONSTRAINT "clients_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "clients_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_clients" ("address", "createdAt", "createdById", "email", "id", "isActive", "phone", "updatedAt", "updatedById") SELECT "address", "createdAt", "createdById", "email", "id", "isActive", "phone", "updatedAt", "updatedById" FROM "clients";
DROP TABLE "clients";
ALTER TABLE "new_clients" RENAME TO "clients";
CREATE UNIQUE INDEX "clients_eikBulstat_key" ON "clients"("eikBulstat");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
