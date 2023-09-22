import { Module } from '@nestjs/common';
import { UsersModule } from '../../endpoints/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { ApiConfigModule } from '../api-config/api.config.module';
import { NativeAuthStrategy } from '../../guards/native.auth.strategy';

@Module({
    imports: [UsersModule, PassportModule, ApiConfigModule],
    providers: [NativeAuthStrategy],
    exports: [],
})
export class AuthModule {}
