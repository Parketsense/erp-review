-- CreateTable
CREATE TABLE "product_type_manufacturers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productTypeId" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_type_manufacturers_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "product_types" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_type_manufacturers_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "manufacturers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "product_type_manufacturers_productTypeId_manufacturerId_key" ON "product_type_manufacturers"("productTypeId", "manufacturerId");
