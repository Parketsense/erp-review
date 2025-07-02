import { IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class UpdateRoomProductDto {
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsBoolean()
  discountEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  wastePercent?: number;
} 