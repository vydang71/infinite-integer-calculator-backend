import { Entity, model, property } from '@loopback/repository';

export type AccessTokenPayload = {
  id: string;
  name: string;
  email: string;
};

@model({ settings: { strict: false } })
export class Account extends Entity {
  @property({
    type: 'string',
    mongodb: { dataType: 'ObjectID' },
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'string',
    required: true,
    index: {
      unique: true,
    },
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  constructor(data?: Partial<Account>) {
    super(data);
  }
}

export interface AccountRelations {
  // describe navigational properties here
}

export type AccountWithRelations = Account & AccountRelations;
