import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ShippingRate } from './model/app.model'; 
import { Token } from './model/token.model'; 

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '12345', 
      database: 'shipping_rates_db',
      models: [ShippingRate, Token],
      autoLoadModels: true,
      synchronize: true, // Creates tables automatically (disable in production)
    }),
    SequelizeModule.forFeature([ShippingRate, Token]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}