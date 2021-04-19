import { BindingKey } from '@loopback/context';

interface AppConfig {
  jwtSecret: string;
  loginDuration: string;
}

interface InfraConfig {
  dbUrl: string;
}

export namespace ConfigBindings {
  export const APP_CONFIG = BindingKey.create<AppConfig>('config.app_config');
  export const INFRA_CONFIG = BindingKey.create<InfraConfig>(
    'config.infra_config',
  );
}