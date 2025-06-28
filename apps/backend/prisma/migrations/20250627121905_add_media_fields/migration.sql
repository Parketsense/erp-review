-- AlterTable
ALTER TABLE "products" ADD COLUMN "documents" JSONB;
ALTER TABLE "products" ADD COLUMN "images" JSONB;
ALTER TABLE "products" ADD COLUMN "models3d" JSONB;
ALTER TABLE "products" ADD COLUMN "textures" JSONB;
ALTER TABLE "products" ADD COLUMN "videoUrl" TEXT;
