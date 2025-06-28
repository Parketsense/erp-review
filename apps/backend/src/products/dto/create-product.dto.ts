import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID, Min, IsArray, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ProductAttributeDto {
  @IsString()
  attributeTypeId: string;

  @IsOptional()
  @IsString()
  attributeValueId?: string;

  @IsOptional()
  @IsString()
  customValue?: string;
}

export class CreateProductDto {
  @IsString()
  code: string;

  @IsString()
  nameBg: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsString()
  productTypeId: string;

  @IsString()
  manufacturerId: string;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  packageSize?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costEur?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costBgn?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  saleBgn?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  saleEur?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  markup?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isRecommended?: boolean;

  @IsOptional()
  @IsBoolean()
  isNew?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  attributes?: ProductAttributeDto[];

  // Media fields
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  models3d?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  textures?: string[];

  @IsOptional()
  @IsString()
  videoUrl?: string;
} 