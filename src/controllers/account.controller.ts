import { inject } from '@loopback/core';
import { repository } from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  requestBody,
  response,
  HttpErrors
} from '@loopback/rest';
import { SecurityBindings, securityId, UserProfile } from '@loopback/security';
import { authenticate } from '@loopback/authentication';
import { Account } from '../models';
import { AccountRepository } from '../repositories';

export class AccountController {
  constructor(
    @repository(AccountRepository)
    public accountRepository: AccountRepository,

    @inject(SecurityBindings.USER, { optional: true })
    private currentUser: UserProfile,
  ) { }

  @post('/accounts/sign-up')
  @response(200, {
    description: 'Register as an account',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Account)
      },
    },
  })
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Account, {
            exclude: ['id'],
            title: 'Account.Create',
          }),
        },
      },
    })
    values: Omit<Account, 'id'>,
  ): Promise<Account> {
    // Check that email exists
    const emailExisted = await this.accountRepository.findByEmail(values.email);
    if (emailExisted) {
      throw new HttpErrors.BadRequest('email_already_exists')
    }

    // Hash password
    const hashedPassword = await this.accountRepository.hashPassword(values.password);

    const account = new Account({
      name: values.name,
      email: values.email,
      password: hashedPassword
    });

    return this.accountRepository.create(account);
  }

  @post('/accounts/login')
  @response(200, {
    description: 'Receive tokens after a successful login',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
            }
          }
        }
      },
    },
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: {
                type: 'string',
              },
              password: {
                type: 'string',
              }
            }
          }
        },
      },
    })
    values: {
      email: string,
      password: string
    },
  ): Promise<{ token: string }> {
    // Check that account exists
    const account = await this.accountRepository.findByEmail(values.email);
    if (!account) {
      throw new HttpErrors.BadRequest('invalid_email')
    }

    // Check password 
    const passwordMatched = await this.accountRepository.comparePassword(values.password, account.password);
    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('invalid_password');
    }

    //Generate token
    const token = await this.accountRepository.generateToken(account)
    return { token }
  }

  @get('/accounts/{id}')
  @response(200, {
    description: 'Account model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Account, { includeRelations: true }),
      },
    },
  })
  @authenticate('jwt')
  async findById(
    @param.path.string('id') id: string): Promise<Account> {
    const accountId = id === 'me' ? this.currentUser[securityId] : id
    return this.accountRepository.findById(accountId);
  }

  @patch('/accounts/{id}')
  @response(204, {
    description: 'Account PATCH success',
  })
  @authenticate('jwt')
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Account, {
            exclude: ['id'],
            title: 'Account.Update',
          }),
        },
      },
    })
    account: Account,
  ): Promise<void> {
    const accountId = id === 'me' ? this.currentUser[securityId] : id
    await this.accountRepository.updateById(accountId, account);
  }
}
