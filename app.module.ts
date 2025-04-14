import { Module } from '@nestjs/common';
import { AppModule as AppFeatureModule } from './src/app.module';

@Module({
  imports: [AppFeatureModule],
})
export class AppModule {}