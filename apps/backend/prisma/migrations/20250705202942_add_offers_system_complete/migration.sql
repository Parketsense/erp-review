/*
  Warnings:

  - Added the required column `clientId` to the `offers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "offer_variants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "offerId" TEXT NOT NULL,
    "variantId" TEXT,
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
    CONSTRAINT "offer_variants_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "offer_variants_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "phase_variants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "offer_rooms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "offerVariantId" TEXT NOT NULL,
    "roomId" TEXT,
    "name" TEXT NOT NULL,
    "area" REAL,
    "discount" REAL DEFAULT 0,
    "discountEnabled" BOOLEAN NOT NULL DEFAULT true,
    "wastePercent" REAL DEFAULT 10,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "offer_rooms_offerVariantId_fkey" FOREIGN KEY ("offerVariantId") REFERENCES "offer_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "offer_rooms_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "variant_rooms" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "offer_room_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "offerRoomId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "roomProductId" TEXT,
    "quantity" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "discount" REAL DEFAULT 0,
    "discountEnabled" BOOLEAN NOT NULL DEFAULT true,
    "wastePercent" REAL DEFAULT 10,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "offer_room_products_offerRoomId_fkey" FOREIGN KEY ("offerRoomId") REFERENCES "offer_rooms" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "offer_room_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "offer_room_products_roomProductId_fkey" FOREIGN KEY ("roomProductId") REFERENCES "room_products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "offer_installations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "offerRoomId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "discount" REAL DEFAULT 0,
    "discountEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "offer_installations_offerRoomId_fkey" FOREIGN KEY ("offerRoomId") REFERENCES "offer_rooms" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_offers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "phaseId" TEXT,
    "clientId" TEXT NOT NULL,
    "offerNumber" TEXT NOT NULL,
    "projectName" TEXT,
    "subject" TEXT,
    "validUntil" DATETIME,
    "expiresAt" DATETIME,
    "conditions" JSONB,
    "emailSubject" TEXT,
    "emailBody" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "lastSentAt" DATETIME,
    "lastSentTo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "offers_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "offers_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "project_phases" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "offers_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_offers" ("conditions", "createdAt", "emailBody", "emailSubject", "id", "lastSentAt", "lastSentTo", "offerNumber", "phaseId", "projectId", "sentCount", "status", "subject", "updatedAt", "validUntil") SELECT "conditions", "createdAt", "emailBody", "emailSubject", "id", "lastSentAt", "lastSentTo", "offerNumber", "phaseId", "projectId", "sentCount", "status", "subject", "updatedAt", "validUntil" FROM "offers";
DROP TABLE "offers";
ALTER TABLE "new_offers" RENAME TO "offers";
CREATE UNIQUE INDEX "offers_offerNumber_key" ON "offers"("offerNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "offer_variants_offerId_variantOrder_key" ON "offer_variants"("offerId", "variantOrder");
