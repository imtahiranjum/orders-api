import { Module } from "@nestjs/common";
import { DatabaseConfig } from "./database.config";
import { ConfigModule as NestConfigModule } from "@nestjs/config";

@Module({
  imports: [NestConfigModule.forRoot({ isGlobal: true })],
  providers: [DatabaseConfig],
  exports: [DatabaseConfig],
})
export class ConfigModule {}
