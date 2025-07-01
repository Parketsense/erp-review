import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { checkAuth } from './auth';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Докато AUTH_OFF=true ➜ пускаме всички
    // Когато стане false, тук ще добавим Keycloak-проверка
    return checkAuth();
  }
} 