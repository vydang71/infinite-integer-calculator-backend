import { inject } from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { Calculation, CalculationRelations, Operation } from '../models';

interface HandleCalculate {
  [x: string]: Function;
}

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

  private bigNumber(value: number): string {
    let result: string = value.toString()
    let e = parseInt(value.toString().split('+')[1])
    if (e > 20) {
      e = e - 20;
      let num = value / Math.pow(10, e)
      result = num.toString();
      result = result + (new Array(e + 1)).join('0')
    }
    return result;
  }

  public calculate(question: string): string {
    const array = question.split(' ');

    const handleCalculate: HandleCalculate = {
      [Operation.ADD]: (num1: number, num2: number) => num1 + num2,
      [Operation.SUBTRACT]: (num1: number, num2: number) => num1 - num2,
      [Operation.MULTIPLY]: (num1: number, num2: number) => num1 * num2,
      [Operation.DIVIDE]: (num1: number, num2: number) => num1 / num2,
    };

    let result: number = 0
    let currentCalculate: Operation = Operation.ADD
    array.forEach(item => {
      if (handleCalculate[item]) {
        currentCalculate = item as Operation
      }
      else {
        result = handleCalculate[currentCalculate](result, parseInt(item))
      }
    })

    return this.bigNumber(result)
  }
}
