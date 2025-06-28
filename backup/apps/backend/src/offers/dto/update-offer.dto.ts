import { PartialType } from '@nestjs/mapped-types';
import { CreateOfferDto, OfferItemDto } from './create-offer.dto';
import { IsEnum, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OfferStatus } from './create-offer.dto';

export class UpdateOfferDto extends PartialType(CreateOfferDto) {
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfferItemDto)
  items?: OfferItemDto[];
} 