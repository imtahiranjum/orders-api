import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { PulsarModule } from './events/pulsar/pulsar.module';
import { OrderModule } from './modules/order/order.module';
import { server, authentication, database } from './config/env.config';
import configValidation from './config/env.config.validation';
import { ConfigModule } from './config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './config/database.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [server, authentication, database],
      validationSchema: configValidation,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env.local'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (databaseConfig: DatabaseConfig) =>
        databaseConfig.createTypeOrmOptions(),
      inject: [DatabaseConfig],
    }),
    ConfigModule,
    OrderModule,
    PulsarModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
