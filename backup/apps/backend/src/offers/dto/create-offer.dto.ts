import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum OfferType {
  MATERIALS = 'MATERIALS',
  INSTALLATION = 'INSTALLATION',
  COMPLETE = 'COMPLETE',
  LUXURY = 'LUXURY',
  CUSTOM = 'CUSTOM'
}

export enum OfferStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export class OfferItemDto {
  @IsString()
  productName: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  totalPrice: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  category?: string;
}

export class CreateOfferDto {
  @IsString()
  offerNumber: string;

  @IsEnum(OfferType)
  type: OfferType;

  @IsString()
  projectId: string;

  @IsString()
  variantId: string;

  @IsString()
  roomId: string;

  @IsString()
  clientId: string;

  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  terms?: string;

  @IsOptional()
  @IsString()
  conditions?: string;

  @IsOptional()
  @IsString()
  deliveryTime?: string;

  @IsOptional()
  @IsString()
  warranty?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfferItemDto)
  items: OfferItemDto[];

  @IsOptional()
  @IsString()
  issuedBy?: string;

  @IsOptional()
  @IsDateString()
  issuedAt?: string;
} 