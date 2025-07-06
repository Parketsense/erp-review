import { IsString, IsOptional, IsDateString, IsNumber, IsBoolean, IsUUID } from 'class-validator';

export class OfferResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  projectId: string;

  @IsOptional()
  @IsUUID()
  phaseId?: string;

  @IsUUID()
  clientId: string;

  @IsString()
  offerNumber: string;

  @IsOptional()
  @IsString()
  projectName?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  conditions?: any;

  @IsOptional()
  @IsString()
  emailSubject?: string;

  @IsOptional()
  @IsString()
  emailBody?: string;

  @IsString()
  status: string;

  @IsNumber()
  sentCount: number;

  @IsOptional()
  @IsDateString()
  lastSentAt?: string;

  @IsOptional()
  @IsString()
  lastSentTo?: string;

  @IsDateString()
  createdAt: string;

  @IsDateString()
  updatedAt: string;

  // Relations
  project?: {
    id: string;
    name: string;
  };

  phase?: {
    id: string;
    name: string;
  };

  client?: {
    id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
  };
} 