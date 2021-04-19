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

  public calculate(question: string): number {
    // Remove unnecessary characters
    // question = question.replace(/[^0-9−+÷×]/g, '')

    // const precedenceOperations = [
    //   [Operation.MULTIPLY, Operation.DIVIDE],
    //   [Operation.ADD, Operation.DIVIDE]
    // ]

    // precedenceOperations.forEach(item => {
    //   var re = new RegExp('(\\d+\\.?\\d*)([\\' + item.join('\\') + '])(\\d+\\.?\\d*)');
    //   console.log('********', { re })
    // })

    const array = question.split(' ');

    const handleCalculate: HandleCalculate = {
      [Operation.ADD]: (num1: number, num2: number) => num1 + num2,
      [Operation.SUBTRACT]: (num1: number, num2: number) => num1 - num2,
      [Operation.MULTIPLY]: (num1: number, num2: number) => num1 * num2,
      [Operation.DIVIDE]: (num1: number, num2: number) => num1 / num2,
    };

    // const result = handleCalculate['+'](parseInt(array[0]), parseInt(array[2]))


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

    return result
  }
}
