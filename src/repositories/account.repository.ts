import { inject } from '@loopback/core';
import { config } from '@loopback/context';
import { DefaultCrudRepository } from '@loopback/repository';
import { UserProfile, securityId } from '@loopback/security';
import { HttpErrors } from '@loopback/rest';
import { genSalt, hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { DbDataSource } from '../datasources';
import { Account, AccountRelations, AccessTokenPayload } from '../models';
import { ConfigBindings } from '../keys';

export class AccountRepository extends DefaultCrudRepository<
  Account,
  typeof Account.prototype.id,
  AccountRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'jwtSecret',
    })
    private jwtSecret: string,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'loginDuration',
    })
    private loginDuration: string,
  ) {
    super(Account, dataSource);
  }

  public async hashPassword(password: string): Promise<string> {
    const salt = await genSalt();
    return hash(password, salt);
  }

  public async comparePassword(str: string, hashedStr: string): Promise<boolean> {
    return compare(str, hashedStr);
  }

  public async generateToken(account: Account): Promise<string> {
    const payload: AccessTokenPayload = {
      id: account.id ?? '',
      name: account.name ?? '',
      email: account.email ?? '',
    };
    return sign(payload, this.jwtSecret, {
      expiresIn: this.loginDuration
    });
  }

  public async verifyToken(token: string): Promise<UserProfile> {
    let userProfile: UserProfile = { [securityId]: '', name: '', email: '' };

    let account: Account;
    try {
      const decodedPayload = verify(token, this.jwtSecret) as AccessTokenPayload;
      account = await this.findById(decodedPayload.id);
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

  public async findByEmail(email: string): Promise<Account | null> {
    return this.findOne({ where: { email } })
  }
}
