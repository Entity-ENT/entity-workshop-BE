import { Injectable, Logger } from '@nestjs/common';

export const SECRET_MANAGER_KEY_PREFIX = 'SM:';

export interface SecretManagerKeyValues {
    keyName: string;
    version: string;
}

@Injectable()
export class SecretManagerConfigService {
    private readonly logger = new Logger(SecretManagerConfigService.name);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    private secretManagerConfigInstance: any;

    getInstance() {
        if (!this.secretManagerConfigInstance) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
            this.secretManagerConfigInstance = new SecretManagerServiceClient();
        }

        return this.secretManagerConfigInstance;
    }

    static getSmKeyValues(keyVariable: string): SecretManagerKeyValues {
        const keyValues = keyVariable.split(':');
        if (!keyVariable || keyVariable.length < 2) {
            throw new Error(`Could not find the environment variable defined for key ${keyVariable}`);
        }

        return {
            keyName: keyValues[1],
            version: keyValues[2] ?? 'latest',
        };
    }

    async getSecretManagerConfigValue(projectId: string, secret: string, version: string = '1'): Promise<string> {
        if (!projectId || !secret) {
            throw new Error(`Could not find the secret manager variable: no projectId and secret params found.`);
        }

        const secretPath = `projects/${projectId}/secrets/${secret}/versions/${version}`;
        const [accessResponse] = await this.getInstance().accessSecretVersion({
            name: secretPath,
        });

        try {
            return accessResponse?.payload?.data.toString();
        } catch (error) {
            throw new Error(`Could not parse the secret manager variable for key ${secret}. Error: ${error}`);
        }
    }
}

export default SecretManagerConfigService;
