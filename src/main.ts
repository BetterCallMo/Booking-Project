// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { config } from 'process';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   app.useGlobalPipes(new ValidationPipe({
//     whitelist: true, 
//     forbidNonWhitelisted: true,
//   }));
//   const port = process.env.PORT;
//   await app.listen(port || 5000);
  
//   await app.listen(port);
//   console.log(`🚀 Application is running on: http://localhost:${port}`);
// }

//By frontend

// bootstrap();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS setup
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // ضيف هنا الـ frontend origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
