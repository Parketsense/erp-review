import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateVariantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  designer?: string;

  @IsOptional()
  @IsString()
  architect?: string;

  @IsOptional()
  @IsNumber()
  architectPercent?: number;

  @IsOptional()
  @IsBoolean()
  includeInOffer?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsString()
  status?: string;
} 