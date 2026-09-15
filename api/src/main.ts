import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { parseCorsUrls, resolveCorsOrigins } from './shared/config/cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Postwise API')
    .setDescription('The Postwise API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const corsOrigins = resolveCorsOrigins({
    nodeEnv: process.env.NODE_ENV,
    corsUrls: parseCorsUrls(process.env.CORS_URLS),
    appUrl: process.env.APP_URL,
    landingUrl: process.env.LANDING_URL,
  });

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Access-Control-Allow-Origin'],
  });

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}
bootstrap();
