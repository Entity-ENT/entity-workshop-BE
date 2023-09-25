import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Strategy } from 'passport-custom';
import { UsersService } from '../endpoints/users/users.service';
import { Users } from '../endpoints/users/users.entity';
import { NativeAuthServer } from '@multiversx/sdk-native-auth-server';
import { ApiConfigService } from '../common/api-config/api.config.service';

@Injectable()
export class NativeAuthStrategy extends PassportStrategy(Strategy, 'nativeAuth') {
    private readonly logger = new Logger(NativeAuthStrategy.name);
    private serverAuth;

    constructor(private readonly apiConfigService: ApiConfigService, private readonly usersService: UsersService) {
        super();
    }

    private getServerAuth(): NativeAuthServer {
        if (this.serverAuth) {
            return this.serverAuth;
        }

        this.serverAuth = new NativeAuthServer({
            apiUrl: this.apiConfigService.getInternalElrondApi(),
            acceptedOrigins: this.apiConfigService.getAuthAcceptedOrigins(),
            maxExpirySeconds: Number(this.apiConfigService.getAuthMaxExpirySeconds()),
        });
        return this.serverAuth;
    }

    async validate(req: Request): Promise<Users> {
        const authorizationToken = req.get('authorization');
        if (!authorizationToken || !authorizationToken.startsWith('Bearer ')) {
            throw new UnauthorizedException();
        }

        const jwtToken = authorizationToken.slice(7);

        try {
            const server = this.getServerAuth();
            await this.serverAuth.validate(jwtToken);
            const payload = await server.decode(jwtToken);
            console.log(payload);
            return await this.usersService.getOrCreateUserAndLog(payload.address);
        } catch (error) {
            this.logger.error(error);
            return new Users();
        }
    }
}
