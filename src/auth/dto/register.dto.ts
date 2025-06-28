import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Моля въведете валиден email адрес' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Паролата трябва да е поне 6 символа' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'Името трябва да е поне 2 символа' })
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;
} 