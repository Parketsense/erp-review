import { PartialType } from '@nestjs/mapped-types';
import { CreateVariantDto } from './create-variant.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateVariantDto extends PartialType(CreateVariantDto) {
  @IsOptional()
  @IsString()
  phaseId?: string;
} 