import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  area?: number;

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