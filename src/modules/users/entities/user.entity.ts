import { CustomBaseEntity } from "src/common/entities/base.entity";
import { Column, Entity } from "typeorm";

@Entity("users")
export class UserEntity extends CustomBaseEntity {
  @Column()
  fullName: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
