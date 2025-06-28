import { IsUUID, IsString, IsOptional, IsNumber, IsDate, IsEnum, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProjectContactDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsString()
  role: string;

  @IsBoolean()
  receivesOffers: boolean;

  @IsBoolean()
  receivesInvoices: boolean;

  @IsBoolean()
  receivesUpdates: boolean;

  @IsBoolean()
  isPrimary: boolean;
}

export class CreateProjectDto {
  @IsUUID()
  clientId: string;

  @IsString()
  name: string;

  @IsEnum(['apartment', 'house', 'office', 'commercial', 'other'])
  projectType: 'apartment' | 'house' | 'office' | 'commercial' | 'other';

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsNumber()
  totalArea?: number;

  @IsOptional()
  @IsNumber()
  roomsCount?: number;

  @IsOptional()
  @IsNumber()
  floorsCount?: number;

  @IsOptional()
  @IsNumber()
  estimatedBudget?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expectedCompletionDate?: Date;

  // Architect fields
  @IsEnum(['none', 'client', 'external'])
  architectType: 'none' | 'client' | 'external';

  @IsOptional()
  @IsUUID()
  architectId?: string;

  @IsOptional()
  @IsString()
  architectName?: string;

  @IsOptional()
  @IsNumber()
  architectCommission?: number;

  @IsOptional()
  @IsString()
  architectPhone?: string;

  @IsOptional()
  @IsString()
  architectEmail?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectContactDto)
  contacts: ProjectContactDto[];

  @IsOptional()
  @IsUUID()
  createdBy?: string;
} 