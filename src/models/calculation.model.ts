import { Entity, model, property, belongsTo } from '@loopback/repository';
import { Account } from './account.model';

@model({ settings: { strict: false } })
export class Calculation extends Entity {
  @property({
    type: 'string',
    mongodb: { dataType: 'ObjectID' },
    id: true,
    generated: true,
  })
  id?: string;

  @belongsTo(
    () => Account,
    { keyTo: 'id', name: 'creator' },
    {
      type: 'string',
      mongodb: { dataType: 'ObjectID' },
    },
  )
  creatorId: string;

  @property({
    type: 'string',
    required: true,
  })
  question: string;

  @property({
    type: 'string',
  })
  answer?: string;

  @property({
    type: 'string',
  })
  createdAt: string;

  constructor(data?: Partial<Calculation>) {
    super(data);
  }
}

export interface CalculationRelations {
  // describe navigational properties here
}

export type CalculationWithRelations = Calculation & CalculationRelations;
