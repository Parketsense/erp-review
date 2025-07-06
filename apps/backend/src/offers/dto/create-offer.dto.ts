import { IsString, IsEmail, IsOptional, IsBoolean, IsNumber, Min, Max, IsDateString, IsUUID, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Transform, Type } from 'class-transformer';

// Helper function to convert YYYY-MM-DD to ISO-8601 DateTime
function transformDate(value: string): string | undefined {
  if (!value || value === '') return undefined;
  
  // If it's already in ISO format, return as is
  if (value.includes('T') || value.includes('Z')) {
    return value;
  }
  
  // If it's in YYYY-MM-DD format, convert to ISO-8601
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00.000Z`;
  }
  
  // If it's a valid date string, try to parse it
  try {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch (error) {
    console.warn('Invalid date format:', value);
  }
  
  return value;
}

export class CreateOfferDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsOptional()
  @IsUUID()
  phaseId?: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  offerNumber: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? undefined : value)
  projectName?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? undefined : value)
  subject?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => transformDate(value))
  validUntil?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => transformDate(value))
  expiresAt?: string;

  @IsOptional()
  conditions?: any; // JSON array of condition strings

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? undefined : value)
  emailSubject?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? undefined : value)
  emailBody?: string;

  @IsOptional()
  @IsString()
  status?: string; // draft, sent, viewed, accepted, rejected

  @IsOptional()
  @IsNumber()
  @Min(0)
  sentCount?: number;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => transformDate(value))
  lastSentAt?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Last sent to must be a valid email address' })
  @Transform(({ value }) => value === '' ? undefined : value)
  lastSentTo?: string;
}

export class CreateOfferVariantDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  materialsCost?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOfferRoomDto)
  rooms?: CreateOfferRoomDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOfferInstallationDto)
  installations?: CreateOfferInstallationDto[];
}

export class CreateOfferRoomDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOfferRoomProductDto)
  products?: CreateOfferRoomProductDto[];
}

export class CreateOfferRoomProductDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;
}

export class CreateOfferInstallationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;
} 