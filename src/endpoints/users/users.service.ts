import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Users } from './users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId, Repository } from 'typeorm';
import { UserRoles } from './users.roles';
import { InternalAddressUtils } from '../../utils/address.utils';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(@InjectRepository(Users) private readonly usersRepository: Repository<Users>) {}

    async findOneById(id: string): Promise<Users | undefined> {
        return await this.usersRepository.findOne({ where: { id: new ObjectId(id) } });
    }

    getUser(publicAddress: string): Promise<Users | undefined> {
        InternalAddressUtils.checkUserWalletAddress(publicAddress);
        return this.getUserByPublicAddress(publicAddress);
    }

    async getOrCreateUserAndLog(publicAddress: string): Promise<Users> {
        InternalAddressUtils.checkUserWalletAddress(publicAddress);
        const userByAddress = await this.getUserByPublicAddress(publicAddress);
        if (userByAddress) {
            return userByAddress;
        }
        return await this.createUserWithWallet(publicAddress);
    }

    async updateEmail(userId: string, email: string, authUser: Users): Promise<Users> {
        await this.checkEmailUnique(email);
        const user = await this.updateUser(userId, authUser, (user) => {
            user.email = email;
        });
        this.logger.log(`Email updated successfully to ${email} for user with id ${userId}`);
        return user;
    }

    private async getUserByPublicAddress(publicAddress: string): Promise<Users | undefined> {
        return this.usersRepository.findOne({ where: { publicAddress } });
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
        if (userId !== authUser.id.toString()) {
            throw new BadRequestException('Could not perform update using the provided id');
        }
    }

    private async checkEmailUnique(email: string): Promise<void> {
        const noOfExistingUsername = await this.usersRepository.count({ where: { email } });
        if (noOfExistingUsername > 0) {
            throw new BadRequestException(`Email ${email} is already taken`);
        }
    }

    private async updateUser(userId: string, authUser: Users, updaterFunction: (user: Users) => void): Promise<Users> {
        UsersService.validateUserId(userId, authUser);
        const user = await this.getByUserId(userId);
        updaterFunction(user);

        await this.usersRepository.update(user.id, user);
        return user;
    }

    private async getByUserId(userId: string): Promise<Users> {
        const user = await this.findOneById(userId);
        if (!user) {
            throw new NotFoundException(`User with id ${userId} not found`);
        }
        return user;
    }
}
