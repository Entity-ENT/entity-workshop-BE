import { BadRequestException } from '@nestjs/common';
import { AddressUtils } from '@multiversx/sdk-nestjs-common';

export class InternalAddressUtils {
    static checkUserWalletAddress(address: string): void {
        if (!address || !AddressUtils.isAddressValid(address) || AddressUtils.isSmartContractAddress(address)) {
            throw new BadRequestException(`Invalid address provided: ${address}`);
        }
    }
}
