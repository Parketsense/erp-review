import { IsUUID, IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateVariantDto {
  @IsUUID()
  phaseId: string;

  @IsString()
  name: string;

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

  @IsBoolean()
  includeInOffer: boolean = true;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  createdBy?: string;
} 