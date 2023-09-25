import { Module } from '@nestjs/common';
import { ApiConfigModule } from './common/api-config/api.config.module';
import { DbModule } from './common/db/db.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guard';
import { EndpointsControllersModule } from './endpoints/endpoints.controllers.module';
import { EndpointsServicesModule } from './endpoints/endpoints.services.module';
import { NativeAuthGuard } from './guards/native.auth.guard';

@Module({
    imports: [DbModule, ApiConfigModule, EndpointsServicesModule, EndpointsControllersModule],
    providers: [
        { provide: APP_GUARD, useClass: NativeAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
    ],
})
export class AppModule {}
