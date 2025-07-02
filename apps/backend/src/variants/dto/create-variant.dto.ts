import { IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  phaseId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  variantOrder?: number;

  @IsOptional()
  @IsString()
  designer?: string;

  @IsOptional()
  @IsString()
  architect?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  architectCommission?: number;

  @IsOptional()
  @IsBoolean()
  includeInOffer?: boolean;

  @IsOptional()
  @IsBoolean()
  discountEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  variantDiscount?: number;
} 