import { Module } from '@nestjs/common';
import { ViewsService } from './views.service';
import { PublicViewsController, ViewsController } from './views.controller';
import { View } from './entities/view.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { GoogleSheetsModule } from '../../google-sheets/google-sheets.module';

@Module({
  imports: [TypeOrmModule.forFeature([View]), GoogleSheetsModule],
  controllers: [ViewsController, PublicViewsController],
  providers: [ViewsService],
})
export class ViewsModule {}
