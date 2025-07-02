import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  area?: number;

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