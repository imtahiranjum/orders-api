import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common/pipes/validation.pipe";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { requestIdMiddleware } from "./common/middlewares/request-id.middleware";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(requestIdMiddleware);

  app.setGlobalPrefix("api/v1");

  const config = new DocumentBuilder()
    .setTitle("Orders API")
    .setVersion("1.0")
    .build();

  SwaggerModule.setup("/api", app, SwaggerModule.createDocument(app, config));

  await app.listen(8000);
}
bootstrap();
