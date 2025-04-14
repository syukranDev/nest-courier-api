import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ShippingRate } from './model/app.model'; 
import { Token } from './model/token.model'; 

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}