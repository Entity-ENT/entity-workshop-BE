import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiConfigService } from './api.config.service';
import configuration from "../../../config/configuration";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
            cache: true,
            isGlobal: true,
            expandVariables: true,
        }),
    ],
    providers: [ApiConfigService],
    exports: [ApiConfigService],
})
export class ApiConfigModule {}
