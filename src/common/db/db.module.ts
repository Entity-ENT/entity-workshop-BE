import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiConfigModule } from '../api-config/api.config.module';
import { ApiConfigService } from '../api-config/api.config.service';
import { Users } from '../../endpoints/users/users.entity';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ApiConfigModule],
            useFactory: async (apiConfigService: ApiConfigService) => ({
                type: 'mongodb',
                url: await apiConfigService.getDatabaseConnectionString(),
                database: apiConfigService.getDatabaseName(),
                entities: [
                    Users,
                ],
                synchronize: true,
                migrationsRun: false,
                useUnifiedTopology: true,
                keepConnectionAlive: true,
            }),
            inject: [ApiConfigService],
        }),
    ],
})
export class DbModule {
}
