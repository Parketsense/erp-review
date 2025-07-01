import { IsString, IsOptional, IsInt, IsIn, Min, IsUUID } from 'class-validator';

export class CreatePhaseDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  phaseOrder?: number;

  @IsOptional()
  @IsIn(['created', 'quoted', 'won', 'lost', 'archived'])
  status?: string;

  @IsOptional()
  @IsUUID()
  architectId?: string;
} 