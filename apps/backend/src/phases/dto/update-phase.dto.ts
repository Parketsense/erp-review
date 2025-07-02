import { IsString, IsOptional, IsIn, IsBoolean, IsInt, Min } from 'class-validator';

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
  @IsInt()
  @Min(1)
  phaseOrder?: number;
} 