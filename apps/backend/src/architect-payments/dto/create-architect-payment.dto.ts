import { IsString, IsNumber, IsDateString, IsOptional, IsEnum } from 'class-validator';

export class CreateArchitectPaymentDto {
  @IsString()
  phaseId: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  paymentDate: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsEnum(['pending', 'completed', 'cancelled'])
  status?: string;
} 