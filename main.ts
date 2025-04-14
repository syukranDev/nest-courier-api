import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // swagger goes between here ===========================
  const config = new DocumentBuilder()
    .setTitle('Shipping Rates API by Syukran Soleh')
    .setDescription('API for fetching shipping rates with token-based authentication')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // swagger goes between here ===========================

  await app.listen(3000);
}
bootstrap();