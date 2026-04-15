import { Module } from '@nestjs/common';
import { SyncHistoriesService } from './sync-histories.service';
import { SyncHistoriesController } from './sync-histories.controller';
import { SyncHistory } from './entities/sync-history.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([SyncHistory])],
  controllers: [SyncHistoriesController],
  providers: [SyncHistoriesService],
})
export class SyncHistoriesModule {}
