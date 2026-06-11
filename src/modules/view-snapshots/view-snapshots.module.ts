import { Module } from '@nestjs/common';
import { ViewSnapshotsService } from './view-snapshots.service';
import { ViewSnapshot } from './entities/view-snapshot.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([ViewSnapshot])],
  providers: [ViewSnapshotsService],
})
export class ViewSnapshotsModule {}
