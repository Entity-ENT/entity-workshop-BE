import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiConfigService {
    constructor(private readonly configService: ConfigService) {
    }

    getCorsOriginAccess(): string[] {
        return this.getConfigValue('corsOriginAccess', 'No cors origins config found');
    }

    getCipherInitializationVector(): string {
        return this.getConfigValue('jwtConfig.cipherIv', 'No jwt config cipher initialization vector found.');
    }

    getCipherPassword(): Promise<string> {
        return this.getConfigValue('jwtConfig.cipherPassword', 'No jwt config cipher password found.');
    }

    getCipherAlgorithm(): string {
        return this.getConfigValue('jwtConfig.cipherAlgorithm', 'No jwt config cipher algorithm found.');
    }

    getDatabaseConnectionString(): Promise<string> {
        return this.getConfigValue('database.connectionString', 'No database connection string found.');
    }

    getDatabaseName(): string {
        return this.getConfigValue('database.databaseName', 'No database name found.');
    }

    getInternalElrondApi(): string {
        return this.getConfigValue('urls.internalElrondApi', 'Internal Elrond Api not found in config files.');
    }

    getAuthAcceptedOrigins(): string[] {
        const acceptedOrigins = this.configService.get<string[]>('auth.acceptedOrigins');
        if (!acceptedOrigins) {
            throw new BadRequestException('Accepted Origins settings missing.');
        }
        return acceptedOrigins;
    }

    getAuthMaxExpirySeconds(): string {
        return this.getConfigValue('auth.maxExpirySeconds', 'Auth maxExpirySeconds value is not set');
    }

    private getConfigValue<V>(key: string, errorMessage: string): V {
        const value = this.configService.get<V>(key);
        if (value === undefined) {
            throw new Error(errorMessage);
        }
        return value;
    }
}
