import { IsString, IsOptional, IsIn, IsBoolean } from 'class-validator';

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
} 