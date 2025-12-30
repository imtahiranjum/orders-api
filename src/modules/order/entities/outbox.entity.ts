import { CustomBaseEntity } from "src/common/entities/base.entity";
import { Column, Entity } from "typeorm";

@Entity("outbox")
export class OutboxEntity extends CustomBaseEntity {
  @Column()
  eventType: string;

  @Column()
  orderId: string;

  @Column()
  userId: string;

  @Column({ type: "jsonb" })
  payload: Record<string, unknown>;

  @Column({ nullable: true })
  publishedAt?: Date;
}
