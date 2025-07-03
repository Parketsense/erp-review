import { IsString, IsOptional, IsIn, IsBoolean, IsNumber, Min, Max } from 'class-validator';

export class CreatePhaseDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['created', 'quoted', 'won', 'lost', 'archived'])
  status?: string;

  @IsOptional()
  @IsBoolean()
  includeArchitectCommission?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  architectCommissionPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  architectCommissionAmount?: number;

  @IsOptional()
  @IsBoolean()
  discountEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  phaseDiscount?: number;
} 