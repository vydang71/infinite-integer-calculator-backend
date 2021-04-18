import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Calculation, CalculationRelations} from '../models';

export class CalculationRepository extends DefaultCrudRepository<
  Calculation,
  typeof Calculation.prototype.id,
  CalculationRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Calculation, dataSource);
  }
}
