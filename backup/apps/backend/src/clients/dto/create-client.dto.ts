import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean, IsDecimal, ValidateIf } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'Иван' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Димитров' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: 'ivan@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+359888123456' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'ул. Витоша 15, София' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  hasCompany?: boolean = false;

  @ApiPropertyOptional({ example: 'ACME ЕООД' })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.hasCompany === true)
  companyName?: string;

  @ApiPropertyOptional({ example: '200123456' })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.hasCompany === true)
  eikBulstat?: string;

  @ApiPropertyOptional({ example: 'BG200123456' })
  @IsString()
  @IsOptional()
  vatNumber?: string;

  @ApiPropertyOptional({ example: 'ул. Бизнес 1, София' })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.hasCompany === true)
  companyAddress?: string;

  @ApiPropertyOptional({ example: '+35921234567' })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.hasCompany === true)
  companyPhone?: string;

  @ApiPropertyOptional({ example: 'office@acme.bg' })
  @IsEmail()
  @IsOptional()
  @ValidateIf((o) => o.hasCompany === true)
  companyEmail?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isArchitect?: boolean = false;

  @ApiPropertyOptional({ example: 10.00 })
  @IsDecimal()
  @IsOptional()
  @ValidateIf((o) => o.isArchitect === true)
  commissionPercent?: number = 10.00;
} 