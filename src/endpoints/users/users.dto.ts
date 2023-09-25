import { IsNotEmpty, IsString } from 'class-validator';
import { ObjectId } from 'typeorm';

export class UserIdDto {
    @IsString()
    @IsNotEmpty()
    readonly userId: string;
}

export class UserPublicAddressDto {
    @IsString()
    @IsNotEmpty()
    readonly publicAddress: string;
}

export class UserEmailDto {
    readonly email: string;
}

export interface UserRolesWrapper {
    userId: string;
    roles: string[];
}
