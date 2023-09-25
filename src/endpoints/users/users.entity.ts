import { Column, Entity, Index, ObjectId, ObjectIdColumn } from 'typeorm';
import { IsString } from 'class-validator';

@Entity('users')
@Index(['publicAddress'], { unique: true })
export class Users {
    @ObjectIdColumn()
    id: ObjectId;

    @IsString()
    @Column()
    publicAddress = '';

    @Column({ nullable: true })
    email = '';

    @Column({ nullable: true })
    username = '';

    @Column()
    roles: string[];
}
