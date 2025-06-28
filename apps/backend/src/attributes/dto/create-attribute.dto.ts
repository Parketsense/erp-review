import { IsString, IsArray, IsOptional, IsBoolean, IsNumber, IsEnum } from 'class-validator';

export class CreateAttributeDto {
  @IsString()
  name: string;

  @IsString()
  nameBg: string;

  @IsString()
  nameEn: string;

  @IsEnum(['SELECT', 'COLOR', 'NUMBER', 'TEXT'])
  type: 'SELECT' | 'COLOR' | 'NUMBER' | 'TEXT';

  @IsArray()
  @IsString({ each: true })
  productTypeIds: string[];

  @IsOptional()
  @IsString()
  dependencyType?: string;

  @IsOptional()
  @IsString()
  dependencyValue?: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  description?: string;
} 