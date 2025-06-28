import { IsUUID, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreatePhaseDto {
  @IsUUID()
  projectId: string;

  @IsString()
  name: string;

  @IsString()  
  type: string;

  @IsOptional()
  @IsString()
  status?: string = 'ACTIVE';

  @IsOptional()
  @IsUUID()
  createdBy?: string;
} 