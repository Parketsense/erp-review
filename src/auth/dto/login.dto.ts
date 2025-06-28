import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Моля въведете валиден email адрес' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Паролата трябва да е поне 6 символа' })
  password: string;
} 