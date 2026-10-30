import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const configured = this.config.get<string>('ADMIN_PASSWORD');
    if (!configured) throw new ServiceUnavailableException('Defina ADMIN_PASSWORD no servidor.');
    const request = context.switchToHttp().getRequest<{ header(name: string): string | undefined }>();
    const supplied = request.header('x-admin-password');
    if (supplied !== configured) throw new UnauthorizedException('Senha administrativa inválida.');
    return true;
  }
}
