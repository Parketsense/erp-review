import { IsString, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProjectContactDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  role?: string = 'other';

  @IsOptional()
  @IsBoolean()
  receivesOffers?: boolean = false;

  @IsOptional()
  @IsBoolean()
  receivesInvoices?: boolean = false;

  @IsOptional()
  @IsBoolean()
  receivesUpdates?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean = false;
}

export class CreateProjectDto {
  @IsString()
  clientId: string;

  @IsString()
  name: string;

  @IsEnum(['apartment', 'house', 'office', 'commercial', 'other'])
  projectType: 'apartment' | 'house' | 'office' | 'commercial' | 'other';

  @IsOptional()
  @IsString()
  address?: string;

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
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  expectedCompletionDate?: string;
  
  // Architect fields
  @IsEnum(['none', 'client', 'external'])
  architectType: 'none' | 'client' | 'external';

  @IsOptional()
  @IsString()
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

  @IsOptional()
  @IsEnum(['draft', 'active', 'completed', 'archived'])
  status?: 'draft' | 'active' | 'completed' | 'archived';

  // Project contacts
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectContactDto)
  contacts?: CreateProjectContactDto[];
} 