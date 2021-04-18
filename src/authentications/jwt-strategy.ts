import { config } from '@loopback/context';
import { Request, HttpErrors } from '@loopback/rest';
import { AuthenticationStrategy } from '@loopback/authentication';
import { UserProfile, securityId } from '@loopback/security';
import cookie from 'cookie';
import { verify } from 'jsonwebtoken';
import { repository } from '@loopback/repository';
import { Account, AccessTokenPayload } from '../models'
import { AccountRepository } from '../repositories';
import { ConfigBindings } from '../keys'


export class JwtAuthenticationStrategy implements AuthenticationStrategy {
  name: string = 'jwt';

  constructor(
    @repository(AccountRepository)
    public accountRepository: AccountRepository,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'jwtSecret',
    })
    private jwtSecret: string,
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

  private async verifyToken(token: string): Promise<UserProfile> {
    let userProfile: UserProfile = { [securityId]: '', name: '', email: '' };

    let account: Account;
    try {
      const decodedPayload = verify(token, this.jwtSecret) as AccessTokenPayload;
      account = await this.accountRepository.findById(decodedPayload.id);
      userProfile = Object.assign(userProfile, {
        [securityId]: account.id,
        name: account.name,
        email: account.email,
      });
    } catch (error) {
      throw new HttpErrors.Unauthorized('invalid_token');
    }

    return userProfile;
  }

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const token = this.extractJwtToken(request);
    if (!token) {
      throw new HttpErrors.Unauthorized();
    }

    return this.verifyToken(token);
  }
}
