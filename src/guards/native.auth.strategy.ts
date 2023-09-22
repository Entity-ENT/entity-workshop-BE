import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Strategy } from 'passport-custom';
import { UsersService } from '../endpoints/users/users.service';
import { Users } from '../endpoints/users/users.entity';
import { NativeAuthServer } from '@multiversx/sdk-native-auth-server';
import { getCurrentTimestamp } from '../helpers/helpers';
import { UserVerifier } from '@multiversx/sdk-wallet/out';
import { Address, SignableMessage } from '@multiversx/sdk-core/out';
import {ApiConfigService} from "../common/api-config/api.config.service";

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

            if (!this.isValidOrigin(payload.origin) || !this.isValidTtl(payload.ttl, payload.extraInfo.timestamp)) {
                return new Users();
            }

            return await this.usersService.getOrCreateUser(payload.address);
        } catch (error) {
            this.logger.error(error);
            return new Users();
        }
    }

    isValidOrigin(origin: string): boolean {
        const validateOrigin = this.apiConfigService.getAuthAcceptedOrigins().includes(origin);
        if (!validateOrigin) {
            this.logger.error('Auth Token has wrong origin.');
            return false;
        }

        return true;
    }

    isValidTtl(ttl: number, timestamp: number): boolean {
        const validateTtl = timestamp + ttl > getCurrentTimestamp();
        if (!validateTtl) {
            this.logger.error('Auth Token expired.');
            return false;
        }

        return true;
    }
}
