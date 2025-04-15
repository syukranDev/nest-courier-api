import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message }) => {
              return `[${timestamp}] ${level}: ${message}`;
            }),
          ),
        }),
        new DailyRotateFile({
          filename: 'logs/application-%DATE%.txt', 
          datePattern: 'YYYY-MM-DD', 
          zippedArchive: false,
          maxSize: '20m', 
          maxFiles: '7d', // notedev: keep 7 day of logs only
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message }) => {
              return `[${timestamp}] ${level}: ${message}`;
            }),
          ),
        }),
      ],
    }),
  });


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