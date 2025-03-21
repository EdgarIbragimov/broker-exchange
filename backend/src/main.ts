import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Добавляем глобальную валидацию
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаляет не определенные в DTO свойства
      transform: true, // Автоматически преобразует примитивы
      forbidNonWhitelisted: true, // Выбрасывает ошибку при не определенных свойствах
    }),
  );

  // Настраиваем CORS для работы с фронтендом
  app.enableCors();

  // Настраиваем Swagger документацию
  const config = new DocumentBuilder()
    .setTitle('Broker Exchange API')
    .setDescription('API для биржевой платформы')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => console.error('Failed to start application:', err));
