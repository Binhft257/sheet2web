import { Module } from '@nestjs/common';
import { CellChangeLogsService } from './cell-change-logs.service';
import { CellChangeLogsController } from './cell-change-logs.controller';
import { CellChangeLog } from './entities/cell-change-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([CellChangeLog])],
  controllers: [CellChangeLogsController],
  providers: [CellChangeLogsService],
})
export class CellChangeLogsModule {}
