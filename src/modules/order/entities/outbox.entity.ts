import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('outbox')
export class Outbox {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventType: string;

  @Column()
  orderId: string;

  @Column()
  tenantId: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ nullable: true })
  publishedAt?: Date;
}
