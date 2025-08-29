import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_CONSTANTS,
      });
      const {createdAt, updatedAt,email, ...userData} = payload; // exclude sensitive, unneeded fields
      request['user'] = {...userData} // attach user info to the request
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }



  private extractTokenFromHeader(request: Request): string | undefined {
    //searches for the authorization header
    const [type, token] = request.headers.authorization?.split(' ') ?? []; // splits the header into type and token (something like that : ["Bearer", "ertyuioiuyt..................."]) -just like header_cheaker guard-
    return type === 'Bearer' ? token : undefined; // checks if the type is "Bearer" and returns the token if true, otherwise returns undefined
  
  }
}