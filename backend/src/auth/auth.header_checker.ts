import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader)
      throw new UnauthorizedException('Missing Authorization header'); // if there is no header called "autherization"

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization header format');
    }
    try {
      //  verify token (checks if is is valid,expired or not)
      const payload = await this.jwtService.verifyAsync(token);

      //  check if user exists in DB
      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) throw new UnauthorizedException('User not found');

      //  attach user info to the request
      request.user = user;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
