import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { User } from '../users/entities/user.entity';
import { ViewPermission } from '../view-permissions/entities/view-permission.entity';
import { ViewSnapshot } from '../view-snapshots/entities/view-snapshot.entity';
import { View } from '../views/entities/view.entity';
import { ViewerController } from './viewer.controller';
import { ViewerService } from './viewer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ViewPermission, View, ViewSnapshot, User]),
  ],
  controllers: [ViewerController],
  providers: [ViewerService],
})
export class ViewerModule {}
