-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "width" REAL,
    "length" REAL,
    "thickness" REAL,
    "material" TEXT,
    "color" TEXT,
    "surface" TEXT,
    "supplier" TEXT,
    "supplierCode" TEXT,
    "brandName" TEXT,
    "priceEur" REAL,
    "priceBgn" REAL,
    "vatIncluded" BOOLEAN NOT NULL DEFAULT false,
    "measureUnit" TEXT NOT NULL DEFAULT 'm2',
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "stockQuantity" REAL DEFAULT 0,
    "imageUrl" TEXT,
    "galleryUrls" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "products_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");
