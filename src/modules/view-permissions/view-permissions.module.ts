import { Module } from '@nestjs/common';
import { ViewPermissionsService } from './view-permissions.service';
import { ViewPermissionsController } from './view-permissions.controller';
import { ViewPermission } from './entities/view-permission.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([ViewPermission])],
  controllers: [ViewPermissionsController],
  providers: [ViewPermissionsService],
})
export class ViewPermissionsModule {}
