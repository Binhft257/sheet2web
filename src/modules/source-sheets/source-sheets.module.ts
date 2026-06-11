import { Module } from '@nestjs/common';
import { SourceSheetsService } from './source-sheets.service';
import { SourceSheet } from './entities/source-sheet.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([SourceSheet])],
  providers: [SourceSheetsService],
})
export class SourceSheetsModule {}
