import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.ts';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  const port = 3002;
  await app.listen(port);
  console.log(`NestJS app listening at http://localhost:${port}`);
}

bootstrap();
