import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import { AuthenticationComponent, registerAuthenticationStrategy } from '@loopback/authentication';
import { AuthorizationDecision, AuthorizationOptions, AuthorizationTags, AuthorizationComponent } from '@loopback/authorization';
import {
  JWTAuthenticationComponent,
  MyUserService,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import path from 'path';
import { MySequence } from './sequence';
import { DbDataSource } from './datasources';
import { ConfigBindings } from './keys';
import { JwtAuthenticationStrategy } from './authentications/jwt-strategy'

export { ApplicationConfig };

export class InfiniteIntegerCalculatorBackendApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    // ------ ADD SNIPPET AT THE BOTTOM ---------
    // Mount authentication system
    this.component(AuthenticationComponent);
    registerAuthenticationStrategy(this, JwtAuthenticationStrategy);
    // Mount jwt component
    this.component(JWTAuthenticationComponent);
    // Bind datasource
    this.dataSource(DbDataSource, UserServiceBindings.DATASOURCE_NAME);

    // ---------- MAKE SURE THE FOLLOWING PARTS ARE CORRECT
    // bind set authorization options
    const authOptions: AuthorizationOptions = {
      precedence: AuthorizationDecision.DENY,
      defaultDecision: AuthorizationDecision.DENY,
    };

    // mount authorization component
    const binding = this.component(AuthorizationComponent);
    // configure authorization component
    this.configure(binding.key).to(authOptions);

    // bind the authorizer provider
    // this
    //   .bind('authorizationProviders.my-authorizer-provider')
    //   .toProvider(MyAuthorizationProvider)
    //   .tag(AuthorizationTags.AUTHORIZER);

    // ------------- END OF SNIPPET -------------

    //new
    this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService);
    this.configure(ConfigBindings.APP_CONFIG).to(this.options.appConfig);
    this.configure(ConfigBindings.INFRA_CONFIG).to(this.options.infraConfig);
  }
}
