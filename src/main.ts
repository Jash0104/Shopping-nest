import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

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
  const port = process.env.PORT || 3001
  await app.listen(port);
  logger.log(`App is running on port ${ port }`)
}
main();
