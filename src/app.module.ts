import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ShippingRate } from './model/app.model'; 
import { Token } from './model/token.model'; 
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

// For testing in container
// console.log({
//   host: process.env.POSTGRES_HOST,
//   user: process.env.POSTGRES_USER,
//   password: process.env.POSTGRES_PASSWORD,
//   database: process.env.POSTGRES_DB,
// })

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST, 
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD, 
      database: process.env.POSTGRES_DB,
      models: [ShippingRate, Token],
      autoLoadModels: true,
      synchronize: true, 
    }),
    SequelizeModule.forFeature([ShippingRate, Token]),
    WinstonModule.forRoot({
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
          maxFiles: '7d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message }) => {
              return `[${timestamp}] ${level}: ${message}`;
            }),
          ),
        }),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}