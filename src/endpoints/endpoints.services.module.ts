import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from '../common/auth/auth.module';

@Module({
    imports: [forwardRef(() => UsersModule), forwardRef(() => AuthModule)],
    exports: [UsersModule, AuthModule],
})
export class EndpointsServicesModule {}
