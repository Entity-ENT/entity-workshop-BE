import {Body, Controller, Param, Post, Put,} from '@nestjs/common';
import {UsersService} from './users.service';
import {Users} from './users.entity';
import {Roles} from '../../utils/decorators/roles.decorator';
import {EncryptedUserDtoResponse, UserEmailDto, UserIdDto, UserPublicAddressDto,} from './users.dto';
import {User} from '../../utils/decorators/user.decorator';
import {UserRoles} from "./users.roles";

@Controller('user')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @Roles(UserRoles.user)
    async createUser(@Body() userDto: UserPublicAddressDto): Promise<EncryptedUserDtoResponse> {
        return this.usersService.getOrCreateUserAndLog(userDto.publicAddress);
    }

    @Put('/:userId/email')
    @Roles(UserRoles.user)
    updateEmail(
        @Param() userIdDto: UserIdDto,
        @Body() userEmailDto: UserEmailDto,
        @User() authUser: Users,
    ): Promise<EncryptedUserDtoResponse> {
        return this.usersService.updateEmail(userIdDto.userId, userEmailDto.email, authUser);
    }

}
