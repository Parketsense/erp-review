-- AlterTable
ALTER TABLE "attribute_types" ADD COLUMN "dependencyType" TEXT DEFAULT 'NONE';
ALTER TABLE "attribute_types" ADD COLUMN "dependencyValue" TEXT;
ALTER TABLE "attribute_types" ADD COLUMN "description" TEXT;
ALTER TABLE "attribute_types" ADD COLUMN "icon" TEXT;
