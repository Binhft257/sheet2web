import { Module } from '@nestjs/common';
import { ViewSnapshotsService } from './view-snapshots.service';
import { ViewSnapshotsController } from './view-snapshots.controller';
import { ViewSnapshot } from './entities/view-snapshot.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([ViewSnapshot])],
  controllers: [ViewSnapshotsController],
  providers: [ViewSnapshotsService],
})
export class ViewSnapshotsModule {}
