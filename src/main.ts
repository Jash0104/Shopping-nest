import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function main() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main')

  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })
  )

  const config = new DocumentBuilder()
    .setTitle('JASHOP RESTFul API')
    .setDescription('Esta API RESTful está diseñada para gestionar un sistema de comercio electrónico, proporcionando funcionalidades esenciales para la autenticación de usuarios, la gestión de productos y la administración de imágenes asociadas a dichos productos')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001
  await app.listen(port);
  logger.log(`App is running on port ${ port }`)
}
main();
