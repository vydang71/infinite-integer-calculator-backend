import { inject, lifeCycleObserver, LifeCycleObserver } from '@loopback/core';
import { juggler } from '@loopback/repository';
import { config } from '@loopback/context';
import { ConfigBindings } from '../keys';

const dbConfig = {
  name: 'db',
  connector: 'mongodb',
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class DbDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'db';
  static readonly defaultConfig = dbConfig;

  constructor(
    @inject('datasources.config.db', { optional: true })
    dsConfig: object = dbConfig,

    @config({
      fromBinding: ConfigBindings.INFRA_CONFIG,
      propertyPath: 'dbUrl',
    })
    private dbUrl: string,

  ) {
    super({ ...dbConfig, url: dbUrl });
  }
}
