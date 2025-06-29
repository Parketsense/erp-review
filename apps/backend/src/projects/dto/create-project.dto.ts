import { IsString, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class ContactDto {
  @IsNumber()
  id: number;

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
  
  // Contacts
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactDto)
  contacts: ContactDto[];
} 