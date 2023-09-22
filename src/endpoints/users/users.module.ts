import {Module} from '@nestjs/common';
import {UsersService} from './users.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Users} from './users.entity';
import {UsersController} from './users.controller';
import {ApiConfigModule} from "../../common/api-config/api.config.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Users]),
        ApiConfigModule,
    ],
    providers: [UsersService],
    exports: [UsersService],
    controllers: [UsersController],
})
export class UsersModule {}
