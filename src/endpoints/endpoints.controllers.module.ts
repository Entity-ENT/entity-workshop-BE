import {Module} from '@nestjs/common';
import {UsersController} from './users/users.controller';
import {EndpointsServicesModule} from './endpoints.services.module';
import {ApiConfigModule} from '../common/api-config/api.config.module';
import {ConfigModule} from '@nestjs/config';
import configuration from '../../config/configuration';

@Module({
    imports: [
        EndpointsServicesModule,
        ApiConfigModule,
        ConfigModule.forRoot({
            load: [configuration],
        }),
    ],
    controllers: [
        UsersController,
    ],
})
export class EndpointsControllersModule {}
