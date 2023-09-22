import {BadRequestException, Injectable, Logger, NotFoundException} from '@nestjs/common';
import {Users} from './users.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {getManager, Repository} from 'typeorm';
import {EntityManager} from 'typeorm/entity-manager/EntityManager';
import {checkIdLength} from '../../helpers/helpers';
import {CipherUtils} from '../../utils/cipher.utils';
import {EncryptedUserDtoResponse, UserRolesWrapper} from "./users.dto";
import {UserRoles} from "./users.roles";
import {AddressUtils} from "../../utils/address.utils";
import {ApiConfigService} from "../../common/api-config/api.config.service";

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    private _manager: EntityManager;

    constructor(
        @InjectRepository(Users) private readonly usersRepository: Repository<Users>,
        private readonly apiConfigService: ApiConfigService,
    ) {
        this._manager = getManager();
    }

    async findOneById(id: string): Promise<Users | undefined> {
        return await this.usersRepository.findOne(id);
    }

    async getOrCreateUserAndLog(publicAddress: string): Promise<EncryptedUserDtoResponse> {
        let user = await this.getOrCreateUser(publicAddress);
        return await this.encryptUserRoles(user);
    }

    getUser(publicAddress: string): Promise<Users | undefined> {
        AddressUtils.checkUserWalletAddress(publicAddress);
        return this.getUserByPublicAddress(publicAddress);
    }

    async getOrCreateUser(publicAddress: string): Promise<Users> {
        AddressUtils.checkUserWalletAddress(publicAddress);
        const userByAddress = await this.getUserByPublicAddress(publicAddress);
        if (userByAddress) {
            return userByAddress;
        }
        return await this.createUserWithWallet(publicAddress);
    }

    async updateEmail(userId: string, email: string, authUser: Users): Promise<EncryptedUserDtoResponse> {
        await this.checkEmailUnique(email);
        const user = await this.updateUser(userId, authUser, (user) => {
            user.email = email;
        });
        this.logger.log(`Email updated successfully to ${email} for user with id ${userId}`);
        return user;
    }

    private async getUserByPublicAddress(publicAddress: string): Promise<Users | undefined> {
        return this.usersRepository.findOne({ publicAddress: publicAddress });
    }

    private async createUserWithWallet(publicAddress: string): Promise<Users> {
        const user = new Users();
        user.publicAddress = publicAddress;
        user.roles = [UserRoles.user];
        const savedUser = await this.usersRepository.save(user);
        this.logger.log(`Successfully created new user with id ${savedUser.id} and public address: ${publicAddress}`);
        return savedUser;
    }

    private static validateUserId(userId: string, authUser: Users): void {
        checkIdLength(userId, 'userId');
        if (userId !== authUser.id.toString()) {
            throw new BadRequestException('Could not perform update using the provided id');
        }
    }

    private async checkEmailUnique(email: string): Promise<void> {
        const noOfExistingUsername = await this.usersRepository.count({ email });
        if (noOfExistingUsername > 0) {
            throw new BadRequestException(`Email ${email} is already taken`);
        }
    }

    private async updateUser(
        userId: string,
        authUser: Users,
        updaterFunction: (user: Users) => void,
    ): Promise<EncryptedUserDtoResponse> {
        UsersService.validateUserId(userId, authUser);
        const user = await this.getByUserId(userId);
        updaterFunction(user);

        await this.usersRepository.update(user.id, user);
        return await this.encryptUserRoles(user);
    }

    private async getByUserId(userId: string): Promise<Users> {
        const user = await this.findOneById(userId);
        if (!user) {
            throw new NotFoundException(`User with id ${userId} not found`);
        }
        return user;
    }

    private async encryptUserRoles(user: Users): Promise<EncryptedUserDtoResponse> {
        const encryptedUser: EncryptedUserDtoResponse = {
            id: user.id,
            publicAddress: user.publicAddress,
            email: user.email,
            username: user.username,
            roles: '',
        };
        const userRoles: UserRolesWrapper = {
            userId: user.id?.toString(),
            roles: user.roles,
        };
        encryptedUser.roles = CipherUtils.encryptStringCipher(
            JSON.stringify(userRoles),
            this.apiConfigService.getCipherInitializationVector(),
            this.apiConfigService.getCipherAlgorithm(),
            await this.apiConfigService.getCipherPassword(),
        );

        return encryptedUser;
    }
}
