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

  private add(num1: number, num2: number) {
    return num1 + num2
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

    console.log('result', result);


    return result;
  }

  public calculate(question: string): string {
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
      [Operation.ADD]: this.add,
      [Operation.SUBTRACT]: (num1: number, num2: number) => num1 - num2,
      [Operation.MULTIPLY]: (num1: number, num2: number) => num1 * num2,
      [Operation.DIVIDE]: (num1: number, num2: number) => num1 / num2,
    };

    // const result = handleCalculate['+'](parseInt(array[0]), parseInt(array[2]))

    // const test: number = 10000000000001000000000000100000000000010000000000001000000000000100000000000010000000000001000000000000
    // console.log('%%%: 00: ', { test });



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

    this.bigNumber(result)
    return result.toString()
  }
}
