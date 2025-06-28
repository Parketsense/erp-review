import { IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class UpdateRoomProductDto {
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsNumber()
  waste?: number;

  @IsOptional()
  @IsBoolean()
  discountEnabled?: boolean;
} 