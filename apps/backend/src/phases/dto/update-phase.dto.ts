import { IsString, IsOptional, IsIn, IsBoolean, IsInt, Min, IsNumber, Max } from 'class-validator';

export class UpdatePhaseDto {
  @IsOptional()
  @IsString()
  name?: string;

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
  @IsBoolean()
  discountEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  phaseDiscount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  phaseOrder?: number;
} 