import { Request, HttpErrors } from '@loopback/rest';
import { AuthenticationStrategy } from '@loopback/authentication';
import { UserProfile } from '@loopback/security';
import cookie from 'cookie';
import { repository } from '@loopback/repository';
import { AccountRepository } from '../repositories';

export class JwtAuthenticationStrategy implements AuthenticationStrategy {
  name: string = 'jwt';

  constructor(
    @repository(AccountRepository)
    public accountRepository: AccountRepository,
  ) { }

  private extractJwtFromHeader(request: Request): string | null {
    const authHeaderValue = request.headers.authorization;
    if (!authHeaderValue || !authHeaderValue.startsWith('Bearer')) {
      return null;
    }

    // Split the string into 2 parts : 'Bearer ' and the `xyz`
    const parts = authHeaderValue.split(' ');
    if (parts.length !== 2) {
      return null;
    }

    return parts[1];
  }

  private extractJwtFromCookie(request: Request): string | null {
    if (!request.headers.cookie) {
      return null;
    }

    const cookies = cookie.parse(request.headers.cookie as string);
    return cookies.jwt;
  }

  private extractJwtToken(request: Request): string | null {
    return (
      this.extractJwtFromHeader(request) ?? this.extractJwtFromCookie(request)
    );
  }

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const token = this.extractJwtToken(request);
    if (!token) {
      throw new HttpErrors.Unauthorized();
    }

    return this.accountRepository.verifyToken(token);
  }
}
