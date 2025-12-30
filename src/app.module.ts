import { Module } from "@nestjs/common";
import { ConfigType, ConfigModule as NestConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { GlobalExceptionFilter } from "./common/filters/exception-filter";
import { AuthGuard } from "./common/guards/auth.guard";
import { ConfigModule } from "./config/config.module";
import { authentication, database, server } from "./config/env.config";
import configValidation from "./config/env.config.validation";
import { PulsarModule } from "./events/pulsar/pulsar.module";
import { HealthModule } from "./modules/health/health.module";
import { OrderModule } from "./modules/order/order.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [server, authentication, database],
      validationSchema: configValidation,
      envFilePath: [`.env.${process.env.NODE_ENV}`, ".env.local"],
    }),
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [],
      inject: [database.KEY],
      useFactory: (db: ConfigType<typeof database>) => {
        return {
          type: "postgres",
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.name,
          synchronize: db.sync,
          ssl: db.ssl ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
          migrations: [__dirname + "/database/migrations/*{.ts,.js}"],
          extra: {
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
          },
        };
      },
    }),
    OrderModule,
    PulsarModule,
    HealthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthGuard,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
  exports: [AuthGuard],
})
export class AppModule {}
