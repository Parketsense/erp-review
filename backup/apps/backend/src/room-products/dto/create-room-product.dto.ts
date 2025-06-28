import { IsUUID, IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateRoomProductDto {
  @IsUUID()
  roomId: string;

  @IsUUID()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  totalPrice: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsNumber()
  waste?: number;

  @IsOptional()
  @IsBoolean()
  discountEnabled?: boolean;

  @IsOptional()
  @IsUUID()
  createdBy?: string;
} 