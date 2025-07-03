-- AlterTable
ALTER TABLE "project_phases" ADD COLUMN "architectCommissionAmount" REAL DEFAULT 0;
ALTER TABLE "project_phases" ADD COLUMN "architectCommissionPercent" REAL DEFAULT 0;

-- CreateTable
CREATE TABLE "architect_payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phaseId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "paymentDate" DATETIME NOT NULL,
    "description" TEXT,
    "paymentMethod" TEXT,
    "referenceNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "architect_payments_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "project_phases" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
