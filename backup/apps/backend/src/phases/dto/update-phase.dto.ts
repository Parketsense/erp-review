import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdatePhaseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['created', 'quoted', 'won', 'lost'])
  status?: 'created' | 'quoted' | 'won' | 'lost';
} 