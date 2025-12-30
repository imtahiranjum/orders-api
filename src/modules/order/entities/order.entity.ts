import { CustomBaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, VersionColumn } from "typeorm";
import { OrderStatus } from "../enums/order-status.enum";

@Entity("orders")
export class OrdersEntity extends CustomBaseEntity {
  @Column({ type: "text" })
  tenantId: string;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.DRAFT,
  })
  status: OrderStatus;

  @VersionColumn({ default: 1, type: "int" })
  version: number;

  @Column({ type: "int", nullable: true })
  totalCents: number | null;
}
