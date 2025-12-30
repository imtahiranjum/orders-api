import { Module } from "@nestjs/common";
import { ConfigType, ConfigModule as NestConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "./config/config.module";
import { authentication, database, server } from "./config/env.config";
import configValidation from "./config/env.config.validation";
import { PulsarModule } from "./events/pulsar/pulsar.module";
import { OrderModule } from "./modules/order/order.module";
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [server, authentication, database],
      validationSchema: configValidation,
      envFilePath: [`.env.${process.env.NODE_ENV}`, ".env.local"],
    }),
    TypeOrmModule.forRootAsync({
      imports: [],
      inject: [database.KEY],
      useFactory: (db: ConfigType<typeof database>) => ({
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
      }),
    }),

    ConfigModule,
    OrderModule,
    PulsarModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
