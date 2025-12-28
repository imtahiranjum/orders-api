import { Column, Generated, PrimaryGeneratedColumn } from "typeorm";
import { Audit } from "./audit.entity";

export abstract class CustomBaseEntity extends Audit {
  @PrimaryGeneratedColumn("uuid")
  id: string;
}