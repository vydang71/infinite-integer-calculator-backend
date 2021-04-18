import { Filter, repository } from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  requestBody,
  response,
} from '@loopback/rest';
import { Calculation } from '../models';
import { CalculationRepository } from '../repositories';

export class CalculationController {
  constructor(
    @repository(CalculationRepository)
    public calculationRepository: CalculationRepository,
  ) { }

  @post('/calculations')
  @response(200, {
    description: 'returns the result of the calculation',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            answer: {
              type: 'string'
            }
          }
        }
      }
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Calculation, {
            exclude: ['id', 'creatorId', 'answer', 'createdAt'],
            title: 'Calculation.Create',
          }),
        },
      },
    })
    calculation: Omit<Calculation, 'id'>,
  ): Promise<{ answer: string }> {

    console.log('55555', { calculation });



    // return this.calculationRepository.create(calculation);
    return { answer: '9' }
  }

  @get('/calculations')
  @response(200, {
    description: 'Array of Calculation model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Calculation, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(Calculation) filter?: Filter<Calculation>,
  ): Promise<Calculation[]> {
    return this.calculationRepository.find(filter);
  }
}
