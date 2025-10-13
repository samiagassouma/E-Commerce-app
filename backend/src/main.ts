import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { environemt } from './environment';


async function bootstrap() {

  const app = await NestFactory.create(AppModule, new ExpressAdapter(express()));
  const frontendUrl = environemt.frontendUrl;
  app.use(cookieParser());

  // Global validation pipe for DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;




  // Enable CORS
  app.enableCors(
   { origin: process.env.NODE_ENV === 'production' ? 'http://frontend-service.development.svc.cluster.local' : 'http://localhost:4200',
    credentials: true,}
  );

  await app.listen(port);
  console.log(`🚀 Server listening on http://localhost:${port}`);

  console.log('DB_HOST from .env:', process.env.DB_HOST);

}
bootstrap();
