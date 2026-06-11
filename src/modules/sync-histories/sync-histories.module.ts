import { Module } from '@nestjs/common';
import { SyncHistoriesService } from './sync-histories.service';
import { SyncHistory } from './entities/sync-history.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([SyncHistory])],
  providers: [SyncHistoriesService],
})
export class SyncHistoriesModule {}
