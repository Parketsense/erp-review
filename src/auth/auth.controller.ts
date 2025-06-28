import { Controller, Get, Post, Body } from '@nestjs/common';

interface RegisterBody {
  email?: string;
  name?: string;
  password?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

@Controller('auth')
export class AuthController {

  @Get('test')
  test() {
    return { message: 'Auth module is working!', timestamp: new Date().toISOString() };
  }

  @Post('register')
  register(@Body() body: RegisterBody) {
    return { 
      message: 'Register endpoint working', 
      received: body,
      user: {
        id: 'test-id',
        email: body.email || 'test@example.com',
        name: body.name || 'Test User'
      }
    };
  }

  @Post('login')
  login(@Body() body: LoginBody) {
    return { 
      message: 'Login endpoint working',
      received: body,
      token: 'fake-jwt-token-for-testing'
    };
  }
} 