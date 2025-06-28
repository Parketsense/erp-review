import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    phone?: string;
  };
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResult> {
    // For now, create a mock user
    const mockUser = {
      id: 'mock-user-id',
      email: registerDto.email,
      name: registerDto.name,
      role: 'USER',
      phone: registerDto.phone,
    };

    // Generate token
    const payload: JwtPayload = {
      sub: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      user: mockUser,
      accessToken,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResult> {
    // Mock login for testing
    const mockUser = {
      id: 'mock-user-id',
      email: loginDto.email,
      name: 'Test User',
      role: 'USER',
    };

    const payload: JwtPayload = {
      sub: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      user: mockUser,
      accessToken,
    };
  }
} 