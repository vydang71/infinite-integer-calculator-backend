import { BindingKey } from '@loopback/context';

interface AppConfig {
  jwtSecret: string;
  loginDuration: string;
}

export namespace ConfigBindings {
  export const APP_CONFIG = BindingKey.create<AppConfig>('config.app_config');
}