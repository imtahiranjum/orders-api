import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: "postgres",
      host: this.configService.get("database.host"),
      port: this.configService.get("database.port"),
      username: this.configService.get("database.username"),
      password: this.configService.get("database.password"),
      database: this.configService.get("database.name"),
      ssl: this.configService.get("database.ssl")
        ? { rejectUnauthorized: false }
        : false,
      synchronize: this.configService.get("database.sync"),
      migrations: [__dirname + "/../database/migrations/*{.ts,.js}"],
      entities: [__dirname + "/../**/*.entity{.ts,.js}"],
      autoLoadEntities: true,
      extra: {
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
    };
  }
}
