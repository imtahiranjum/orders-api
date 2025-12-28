import { AfterSoftRemove, AfterUpdate, Column } from 'typeorm';

export abstract class Audit {
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;

  @AfterUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }

  @AfterSoftRemove()
  removeTimestamp() {
    this.updatedAt = new Date();
  }
}
