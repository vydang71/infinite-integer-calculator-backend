import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors
} from '@loopback/rest';
import { genSalt, hash } from 'bcryptjs'
import { Account } from '../models';
import { AccountRepository } from '../repositories';

export class AccountController {
  constructor(
    @repository(AccountRepository)
    public accountRepository: AccountRepository,
  ) { }

  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt();
    return hash(password, salt);
  }

  @post('/accounts/sign-up')
  @response(200, {
    description: 'Receive tokens after a successful registration',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          items: getModelSchemaRef(Account)
        },
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
    const emailExisted = await this.accountRepository.findOne({ where: { email: values.email } });
    if (emailExisted) {
      throw new HttpErrors.BadRequest('email_already_exists')
    }

    // Hash password
    const hashedPassword = await this.hashPassword(values.password);

    const account = new Account({
      name: values.name,
      email: values.email,
      password: hashedPassword
    });

    return this.accountRepository.create(account);
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
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Account, { exclude: 'where' }) filter?: FilterExcludingWhere<Account>
  ): Promise<Account> {
    return this.accountRepository.findById(id, filter);
  }

  @patch('/accounts/{id}')
  @response(204, {
    description: 'Account PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Account, { partial: true }),
        },
      },
    })
    account: Account,
  ): Promise<void> {
    await this.accountRepository.updateById(id, account);
  }
}
