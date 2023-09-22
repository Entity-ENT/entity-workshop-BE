import {Column, Entity, Index, ObjectID, ObjectIdColumn} from 'typeorm';
import {IsString} from 'class-validator';

@Entity('users')
@Index(['publicAddress'], { unique: true })
export class Users {
    @ObjectIdColumn()
    id: ObjectID;

    @IsString()
    @Column()
    publicAddress: string = '';

    @Column({ nullable: true })
    email: string = '';

    @Column({ nullable: true })
    username: string = '';

    @Column()
    roles: string[];

}
