import { BadRequestException, Logger } from '@nestjs/common';
import { Address } from '@multiversx/sdk-core/out';

export class AddressUtils {
    static isAddressValid(address: string | Buffer): boolean {
        try {
            new Address(address);
            return true;
        } catch (error) {
            return false;
        }
    }

    static checkUserWalletAddress(address: string): void {
        if (!address || !AddressUtils.isAddressValid(address) || AddressUtils.isSmartContractAddress(address)) {
            throw new BadRequestException(`Invalid address provided: ${address}`);
        }
    }

    static isSmartContractAddress(address: string): boolean {
        if (address.toLowerCase() === 'metachain') {
            return true;
        }

        try {
            return new Address(address).isContractAddress();
        } catch (error) {
            const logger = new Logger(AddressUtils.name);
            logger.error(`Error when determining whether address '${address}' is a smart contract address`);
            logger.error(error);
            return false;
        }
    }
}
